import mongoose from "mongoose";
import Queue, { type QueueStatus } from "../models/Queue.js";
import Branch from "../models/Branch.js";
import Department from "../models/Department.js";
import { User } from "../models/User.js";
import Agent from "../models/Agent.js";
import { emitQueueCreated, emitQueueUpdated, emitQueueCalled, emitStatsUpdated, emitQueuePosition } from "../sockets/emitter.js";
import type { QueueData } from "../sockets/socketTypes.js";
import { createAndEmitNotification } from "./notificationService.js";
import { isWithinOfficeHours, startNoShowTimer } from "./agentService.js";
import { cancelNoShowTimer } from "./agentService.js";

// Local date as YYYY-MM-DD - matches Queue.date storage format
const today = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

// Push the live spot of EVERY waiting ticket in a department to its owner's
// private room. Called whenever the line changes (call next, complete,
// cancel, delete) so waiting customers see their number move without
// refreshing. Position 1 = "you are next".
const emitDepartmentPositions = async (
    departmentId: string | mongoose.Types.ObjectId,
    date: string
): Promise<void> => {
    const waiting = await Queue.find({
        department: departmentId,
        date,
        status: "waiting",
    })
        .sort({ ticketNumber: 1 })
        .select("customer");

    waiting.forEach((q, index) => {
        emitQueuePosition(
            {
                queueId: q._id.toString(),
                department: departmentId.toString(),
                position: index + 1,
            },
            q.customer.toString()
        );
    });
};

// How many WAITING tickets of the same department/day are ahead of this one.
const countTicketsAhead = async (
    departmentId: string | mongoose.Types.ObjectId,
    date: string,
    ticketNumber: number
): Promise<number> =>
    Queue.countDocuments({
        department: departmentId,
        date,
        status: "waiting",
        ticketNumber: { $lt: ticketNumber },
    });

const toQueueData = (q: InstanceType<typeof Queue>): QueueData => {    const branchRaw = q.branch as unknown as mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; name: string; location?: string };
    const departmentRaw = q.department as unknown as mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; name: string; prefix?: string };
    const customerRaw = q.customer as unknown as mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; name?: string };
    const agentRaw = (q as any).agent as unknown as mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; name?: string; counterNumber?: number } | undefined;

    const branchData: QueueData["branch"] = branchRaw && typeof branchRaw === "object" && "name" in branchRaw
        ? { _id: (branchRaw._id as mongoose.Types.ObjectId).toString(), name: branchRaw.name, ...(branchRaw.location !== undefined ? { location: branchRaw.location } : {}) }
        : branchRaw.toString();
    const departmentData: QueueData["department"] = departmentRaw && typeof departmentRaw === "object" && "name" in departmentRaw
        ? { _id: (departmentRaw._id as mongoose.Types.ObjectId).toString(), name: departmentRaw.name, ...(departmentRaw.prefix !== undefined ? { prefix: departmentRaw.prefix } : {}) }
        : departmentRaw.toString();
    const customerData: QueueData["customer"] = customerRaw && typeof customerRaw === "object" && "name" in customerRaw
        ? { _id: (customerRaw._id as mongoose.Types.ObjectId).toString(), name: customerRaw.name }
        : customerRaw.toString();

    const data: QueueData = {
        _id: q._id.toString(),
        ticketNumber: q.ticketNumber,
        displayNumber: q.displayNumber,
        branch: branchData,
        department: departmentData,
        customer: customerData,
        status: q.status,
        date: q.date,
    };
    if (q.counterNumber !== undefined) data.counterNumber = q.counterNumber;

    // Include agent if populated
    if (agentRaw) {
        if (typeof agentRaw === "object" && "name" in agentRaw) {
            data.agent = { _id: (agentRaw._id as mongoose.Types.ObjectId).toString(), name: agentRaw.name, ...(agentRaw.counterNumber !== undefined ? { counterNumber: agentRaw.counterNumber } : {}) };
        } else {
            data.agent = agentRaw.toString();
        }
    }

    if (q.calledAt !== undefined) data.calledAt = q.calledAt;
    if (q.servingAt !== undefined) data.servingAt = q.servingAt;
    if (q.completedAt !== undefined) data.completedAt = q.completedAt;
    if (q.cancelledAt !== undefined) data.cancelledAt = q.cancelledAt;
    return data;
};

interface CreateQueueData {
    branch: string;
    department: string;
    customer: string;
}

export const createQueue = async ({
    branch,
    department,
    customer,
}: CreateQueueData) => {
    if (
        !mongoose.Types.ObjectId.isValid(branch) ||
        !mongoose.Types.ObjectId.isValid(department) ||
        !mongoose.Types.ObjectId.isValid(customer)
    ) {
        throw new Error("Invalid branch, department, or customer ID");
    }

    const customerExists = await User.findById(customer);
    if (!customerExists) {
        throw new Error("Customer not found");
    }

    const branchData = await Branch.findById(branch);
    if (!branchData) {
        throw new Error("Branch not found");
    }

    if (!branchData.isActive) {
        throw new Error("Branch is not active");
    }

    const departmentData = await Department.findById(department);
    if (!departmentData) {
        throw new Error("Department not found");
    }

    if (!departmentData.isActive) {
        throw new Error("Department is not active");
    }

    if (departmentData.branch.toString() !== branch) {
        throw new Error("Department does not belong to this branch");
    }

    // Check office hours: find an active agent for this department to check hours
    const activeAgent = await Agent.findOne({ department, isActive: true });
    if (activeAgent && !isWithinOfficeHours(activeAgent.officeStart, activeAgent.officeEnd)) {
        throw new Error(`Office hours are ${activeAgent.officeStart}:00 - ${activeAgent.officeEnd}:00. Currently outside office hours.`);
    }

    const date = today();
    const prefix = departmentData.prefix || "Q";

    // Retry on duplicate-ticket races: two concurrent requests can read the
    // same last ticket number; the unique {department, date, ticketNumber}
    // index rejects the loser, so recompute and try again.
    let queue: InstanceType<typeof Queue> | null = null;
    const MAX_ATTEMPTS = 3;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const lastQueue = await Queue.findOne({
            department,
            date,
        }).sort({
            ticketNumber: -1,
        });

        const ticketNumber = lastQueue ? lastQueue.ticketNumber + 1 : 1;
        const displayNumber = `${prefix}${String(ticketNumber).padStart(3, "0")}`;

        try {
            queue = await Queue.create({
                ticketNumber,
                displayNumber,
                branch,
                department,
                customer,
                status: "waiting",
                date,
            });
            break;
        } catch (error) {
            const isDuplicateKey =
                (error as { code?: number })?.code === 11000;
            if (!isDuplicateKey || attempt === MAX_ATTEMPTS - 1) {
                throw new Error("Ticket could not be created, please try again");
            }
        }
    }

    if (!queue) {
        throw new Error("Ticket could not be created, please try again");
    }

    const populated = await Queue.findById(queue._id)
        .populate("branch", "name location")
        .populate("department", "name prefix")
        .populate("customer", "name")
        .populate("agent");

    const branchId = typeof queue.branch === "string" ? queue.branch : queue.branch._id.toString();
    const deptId = typeof queue.department === "string" ? queue.department : queue.department._id.toString();
    emitQueueCreated(toQueueData(populated!), branchId, deptId);

    // Confirm the booking to the customer right away - without this, a user
    // never hears anything from the moment they take a ticket until staff
    // calls them, which made the bell feel broken for non-admins.
    await createAndEmitNotification({
        userId: customer,
        type: "queue_created",
        title: "Ticket booked",
        message: `Ticket ${queue.displayNumber} booked at ${departmentData.name}. We'll notify you when it's your turn.`,
        queueId: queue._id.toString(),
    });

    // Tell the customer where they stand in the line as soon as they join.
    emitQueuePosition(
        {
            queueId: queue._id.toString(),
            department: deptId,
            position: (await countTicketsAhead(deptId, date, queue.ticketNumber)) + 1,
        },
        customer
    );

    const stats = await getQueueStats();
    emitStatsUpdated(stats);

    return queue;
};

export const getAllQueues = async () => {
    return await Queue.find()
        .populate("branch", "name location")
        .populate("department", "name prefix")
        .sort({ createdAt: -1 });
};

export const getMyQueues = async (customerId: string) => {
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
        throw new Error("Invalid customer ID");
    }

    const queues = await Queue.find({
        customer: customerId,
    })
        .populate("branch", "name location")
        .populate("department", "name prefix")
        .sort({ createdAt: -1 });

    // Attach the live position (rank among today's waiting tickets of the
    // same department) so the client can render it immediately on load -
    // socket pushes keep it fresh after that.
    return await Promise.all(
        queues.map(async (q) => {
            if (q.status !== "waiting") return q.toObject();

            const departmentRaw = q.department as unknown as
                | mongoose.Types.ObjectId
                | { _id: mongoose.Types.ObjectId };
            const departmentId =
                typeof departmentRaw === "string"
                    ? departmentRaw
                    : departmentRaw._id.toString();

            const ahead = await countTicketsAhead(
                departmentId,
                q.date,
                q.ticketNumber
            );

            return { ...q.toObject(), position: ahead + 1 };
        })
    );
};

export const getQueueById = async (queueId: string) => {
    if (!mongoose.Types.ObjectId.isValid(queueId)) {
        throw new Error("Invalid queue ID");
    }

    const queue = await Queue.findById(queueId)
        .populate("branch", "name location")
        .populate("department", "name prefix")
        .populate("customer", "name email");

    if (!queue) {
        throw new Error("Queue not found");
    }

    return queue;
};

interface CallNextOptions {
    counterNumber?: number | undefined;
    branchId?: string | undefined;
    departmentId?: string | undefined;
}

export const callNextQueue = async ({
    counterNumber,
    branchId,
    departmentId,
}: CallNextOptions = {}) => {
    // Only call tickets issued TODAY, scoped to a department (preferred)
    // or branch when provided - never pull tickets across branches/departments.
    const filter: Record<string, unknown> = {
        status: "waiting",
        date: today(),
    };

    if (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) {
        filter.department = departmentId;
    } else if (branchId && mongoose.Types.ObjectId.isValid(branchId)) {
        filter.branch = branchId;
    }

    const queue = await Queue.findOne(filter)
        .sort({ ticketNumber: 1 })
        .populate("branch", "name location")
        .populate("department", "name prefix");

    if (!queue) {
        throw new Error("No waiting queues");
    }

    queue.status = "called";
    queue.calledAt = new Date();
    if (counterNumber) {
        queue.counterNumber = counterNumber;
    }
    await queue.save();

    const populated = await Queue.findById(queue._id)
        .populate("branch", "name location")
        .populate("department", "name prefix")
        .populate("customer", "name")
        .populate("agent");

    const queueBranchId = typeof queue.branch === "string" ? queue.branch : queue.branch._id.toString();
    const queueDeptId = typeof queue.department === "string" ? queue.department : queue.department._id.toString();
    emitQueueCalled(toQueueData(populated!), queueBranchId, queueDeptId);

    // Notify the customer in real time: their ticket was just called.
    // queue.customer is still a plain ObjectId here (only `populated` has it expanded).
    await createAndEmitNotification({
        userId: queue.customer.toString(),
        type: "queue_called",
        title: "It's your turn!",
        message: queue.counterNumber
            ? `Ticket ${queue.displayNumber} - please go to Counter ${queue.counterNumber}`
            : `Ticket ${queue.displayNumber} - please proceed to the counter`,
        queueId: queue._id.toString(),
    });

    // Everyone behind just moved one spot up - push their new positions.
    await emitDepartmentPositions(queue.department, queue.date);

    // Start no-show timer: if customer doesn't show up in 2 minutes, skip them
    startNoShowTimer(queue._id.toString(), null);

    const stats = await getQueueStats();
    emitStatsUpdated(stats);

    return queue;
};

export interface QueueStats {
    total: number;
    waiting: number;
    called: number;
    serving: number;
    completed: number;
    cancelled: number;
}

export const getQueueStats = async (): Promise<QueueStats> => {
    // Stats reflect today's activity, not the lifetime of the system
    const date = today();

    const [total, waiting, called, serving, completed, cancelled] =
        await Promise.all([
            Queue.countDocuments({ date }),
            Queue.countDocuments({ date, status: "waiting" }),
            Queue.countDocuments({ date, status: "called" }),
            Queue.countDocuments({ date, status: "serving" }),
            Queue.countDocuments({ date, status: "completed" }),
            Queue.countDocuments({ date, status: "cancelled" }),
        ]);

    return { total, waiting, called, serving, completed, cancelled };
};

export const updateQueueStatus = async (
    queueId: string,
    status: Exclude<QueueStatus, "waiting">,
    counterNumber?: number
) => {
    if (!mongoose.Types.ObjectId.isValid(queueId)) {
        throw new Error("Invalid queue ID");
    }

    const queue = await Queue.findById(queueId);

    if (!queue) {
        throw new Error("Queue not found");
    }

    if (queue.status === "completed" || queue.status === "cancelled") {
        throw new Error("This queue can no longer be updated");
    }

    if (queue.status === status) {
        return queue;
    }

    // Customer showed up or ticket resolved - cancel no-show timer
    if (status === "serving" || status === "completed" || status === "cancelled") {
        cancelNoShowTimer(queueId);
    }

    queue.status = status;

    if (status === "serving" && counterNumber) {
        queue.counterNumber = counterNumber;
    }

    const now = new Date();
    if (status === "called" && !queue.calledAt) {
        queue.calledAt = now;
    } else if (status === "serving" && !queue.servingAt) {
        queue.servingAt = now;
    } else if (status === "completed") {
        queue.completedAt = now;
    } else if (status === "cancelled") {
        queue.cancelledAt = now;
    }

    await queue.save();

    const populated = await Queue.findById(queue._id)
        .populate("branch", "name location")
        .populate("department", "name prefix")
        .populate("customer", "name")
        .populate("agent");

    const branchId = typeof queue.branch === "string" ? queue.branch : queue.branch._id.toString();
    const deptId = typeof queue.department === "string" ? queue.department : queue.department._id.toString();
    emitQueueUpdated(toQueueData(populated!), branchId, deptId);

    // Map each staff action to a customer-facing notification.
    // ("called" via this path also notifies, in case admin calls manually.)
    const statusNotifications: Record<
        Exclude<QueueStatus, "waiting">,
        { type: "queue_called" | "queue_serving" | "queue_completed" | "queue_cancelled"; title: string; message: string }
    > = {
        called: {
            type: "queue_called",
            title: "It's your turn!",
            message: `Ticket ${queue.displayNumber} - please proceed to the counter`,
        },
        serving: {
            type: "queue_serving",
            title: "You're being served",
            message: `Ticket ${queue.displayNumber} is now being served${queue.counterNumber ? ` at Counter ${queue.counterNumber}` : ""}`,
        },
        completed: {
            type: "queue_completed",
            title: "Visit complete",
            message: `Ticket ${queue.displayNumber} is completed. Thank you!`,
        },
        cancelled: {
            type: "queue_cancelled",
            title: "Ticket cancelled",
            message: `Your ticket ${queue.displayNumber} was cancelled. Please contact staff if this is unexpected.`,
        },
    };

    await createAndEmitNotification({
        userId: queue.customer.toString(),
        ...statusNotifications[status],
        queueId: queue._id.toString(),
    });

    // serving/completed/cancelled remove someone from the waiting line,
    // so everyone behind moves up - push their new positions.
    if (status !== "called") {
        await emitDepartmentPositions(queue.department, queue.date);
    }

    const stats = await getQueueStats();
    emitStatsUpdated(stats);

    return queue;
};

// Cancel my own ticket - only the owner can do this,
// and only while still waiting or called.
export const cancelMyQueue = async (queueId: string, customerId: string) => {
    if (!mongoose.Types.ObjectId.isValid(queueId)) {
        throw new Error("Invalid queue ID");
    }

    const queue = await Queue.findById(queueId);

    if (!queue) {
        throw new Error("Queue not found");
    }

    if (queue.customer.toString() !== customerId) {
        throw new Error("You can only cancel your own tickets");
    }

    if (queue.status !== "waiting" && queue.status !== "called") {
        throw new Error("Only waiting or called tickets can be cancelled");
    }

    // Cancel no-show timer if ticket was called
    cancelNoShowTimer(queueId);

    queue.status = "cancelled";
    queue.cancelledAt = new Date();
    await queue.save();

    const populated = await Queue.findById(queue._id)
        .populate("branch", "name location")
        .populate("department", "name prefix")
        .populate("customer", "name")
        .populate("agent");

    const branchId = typeof queue.branch === "string" ? queue.branch : queue.branch._id.toString();
    const deptId = typeof queue.department === "string" ? queue.department : queue.department._id.toString();
    emitQueueUpdated(toQueueData(populated!), branchId, deptId);

    // The cancelled spot frees up - everyone behind moves up.
    await emitDepartmentPositions(queue.department, queue.date);

    const stats = await getQueueStats();
    emitStatsUpdated(stats);

    return queue;
};

export const deleteQueue = async (queueId: string) => {
    if (!mongoose.Types.ObjectId.isValid(queueId)) {
        throw new Error("Invalid queue ID");
    }

    const queue = await Queue.findByIdAndDelete(queueId);

    if (!queue) {
        throw new Error("Queue not found");
    }

    // If a waiting ticket was deleted, the line shifts - push new positions.
    if (queue.status === "waiting") {
        await emitDepartmentPositions(queue.department, queue.date);
    }

    const stats = await getQueueStats();
    emitStatsUpdated(stats);

    return { message: "Queue deleted successfully" };
};

// Current spot of one ticket - position 1 means "you are next".
// Owner or admin only; returns null while the ticket isn't waiting.
export const getQueuePosition = async (
    queueId: string,
    requesterId: string,
    requesterRole: string
): Promise<{ queueId: string; status: string; position: number | null }> => {
    if (!mongoose.Types.ObjectId.isValid(queueId)) {
        throw new Error("Invalid queue ID");
    }

    const queue = await Queue.findById(queueId);

    if (!queue) {
        throw new Error("Queue not found");
    }

    if (requesterRole !== "admin" && queue.customer.toString() !== requesterId) {
        throw new Error("You can only view your own ticket position");
    }

    if (queue.status !== "waiting") {
        return { queueId, status: queue.status, position: null };
    }

    const ahead = await countTicketsAhead(
        queue.department,
        queue.date,
        queue.ticketNumber
    );

    return { queueId, status: queue.status, position: ahead + 1 };
};