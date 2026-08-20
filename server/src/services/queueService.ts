import mongoose from "mongoose";
import Queue, { type QueueStatus } from "../models/Queue.js";
import Branch from "../models/Branch.js";
import Department from "../models/Department.js";
import { User } from "../models/User.js";
import { emitQueueCreated, emitQueueUpdated, emitQueueCalled, emitStatsUpdated } from "../sockets/emitter.js";
import type { QueueData } from "../sockets/socketTypes.js";

const toQueueData = (q: InstanceType<typeof Queue>): QueueData => {
    const branchRaw = q.branch as unknown as mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; name: string; location?: string };
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
        console.error("Branch mismatch:", {
            deptBranch: departmentData.branch.toString(),
            reqBranch: branch,
        });
        throw new Error("Department does not belong to this branch");
    }

    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const lastQueue = await Queue.findOne({
        department,
        date,
    }).sort({
        ticketNumber: -1,
    });

    const ticketNumber = lastQueue ? lastQueue.ticketNumber + 1 : 1;
    const prefix = departmentData.prefix || "Q";
    const displayNumber = `${prefix}${String(ticketNumber).padStart(3, "0")}`;

    const queue = await Queue.create({
        ticketNumber,
        displayNumber,
        branch,
        department,
        customer,
        status: "waiting",
        date,
    });

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

export const callNextQueue = async (counterNumber?: number) => {
    const queue = await Queue.findOne({ status: "waiting" })
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

    const branchId = typeof queue.branch === "string" ? queue.branch : queue.branch._id.toString();
    const deptId = typeof queue.department === "string" ? queue.department : queue.department._id.toString();
    emitQueueCalled(toQueueData(populated!), branchId, deptId);

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
    const [total, waiting, called, serving, completed, cancelled] =
        await Promise.all([
            Queue.countDocuments(),
            Queue.countDocuments({ status: "waiting" }),
            Queue.countDocuments({ status: "called" }),
            Queue.countDocuments({ status: "serving" }),
            Queue.countDocuments({ status: "completed" }),
            Queue.countDocuments({ status: "cancelled" }),
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