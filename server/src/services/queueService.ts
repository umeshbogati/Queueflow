import mongoose from "mongoose";
import Queue, { type QueueStatus } from "../models/Queue.js";
import Branch from "../models/Branch.js";
import Department from "../models/Department.js";
import { User } from "../models/User.js";
import { emitQueueCreated, emitQueueUpdated, emitQueueCalled, emitStatsUpdated } from "../sockets/emitter.js";
import type { QueueData } from "../sockets/socketTypes.js";
import { createAndEmitNotification } from "./notificationService.js";

// Local date as YYYY-MM-DD - matches Queue.date storage format
const today = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const toQueueData = (q: InstanceType<typeof Queue>): QueueData => {    const branchRaw = q.branch as unknown as mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; name: string; location?: string };
    const departmentRaw = q.department as unknown as mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; name: string; prefix?: string };
    const customerRaw = q.customer as unknown as mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; name?: string };

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
        .populate("customer", "name");

    const branchId = typeof queue.branch === "string" ? queue.branch : queue.branch._id.toString();
    const deptId = typeof queue.department === "string" ? queue.department : queue.department._id.toString();
    emitQueueCreated(toQueueData(populated!), branchId, deptId);

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

    return await Queue.find({
        customer: customerId,
    })
        .populate("branch", "name location")
        .populate("department", "name prefix")
        .sort({ createdAt: -1 });
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
        .populate("customer", "name");

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
        .populate("customer", "name");

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

    const stats = await getQueueStats();
    emitStatsUpdated(stats);

    return { message: "Queue deleted successfully" };
};