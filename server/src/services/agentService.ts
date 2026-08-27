import mongoose from "mongoose";
import Agent from "../models/Agent.js";
import Queue from "../models/Queue.js";
import Branch from "../models/Branch.js";
import Department from "../models/Department.js";
import { User } from "../models/User.js";
import { emitAgentUpdated, emitStatsUpdated, emitAutoCallNext, emitQueueNoShow } from "../sockets/emitter.js";
import type { AgentData } from "../sockets/socketTypes.js";
import { createAndEmitNotification } from "./notificationService.js";

// Local date as YYYY-MM-DD
const today = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

// Default delay before auto-calling next ticket (30 seconds)
const AUTO_CALL_DELAY_MS = 30_000;

// No-show timeout: if a called customer doesn't show up in 2 minutes, skip them
const NO_SHOW_TIMEOUT_MS = 120_000;

// Track pending auto-call timers so they can be cancelled
const pendingAutoCalls = new Map<string, ReturnType<typeof setTimeout>>();

// Track no-show timers per queue ticket (key: queueId)
const pendingNoShows = new Map<string, ReturnType<typeof setTimeout>>();

// Check if current time is within office hours
export const isWithinOfficeHours = (officeStart: number, officeEnd: number): boolean => {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= officeStart && currentHour < officeEnd;
};

// Reset daily token counters for all agents (call on new day)
const resetDailyCounters = async (): Promise<void> => {
    const date = today();
    await Agent.updateMany(
        { lastResetDate: { $ne: date } },
        { tokensServedToday: 0, lastResetDate: date }
    );
};

// Ensure daily counters are fresh before any agent operation
const ensureFreshCounters = async (): Promise<void> => {
    const date = today();
    const staleAgents = await Agent.countDocuments({ lastResetDate: { $ne: date } });
    if (staleAgents > 0) {
        await resetDailyCounters();
    }
};

// Cancel a pending auto-call for an agent (e.g. if agent goes offline)
export const cancelPendingAutoCall = (agentId: string): void => {
    const timer = pendingAutoCalls.get(agentId);
    if (timer) {
        clearTimeout(timer);
        pendingAutoCalls.delete(agentId);
    }
};

// Cancel a no-show timer for a queue ticket (e.g. when customer shows up)
export const cancelNoShowTimer = (queueId: string): void => {
    const timer = pendingNoShows.get(queueId);
    if (timer) {
        clearTimeout(timer);
        pendingNoShows.delete(queueId);
    }
};

// Start a no-show timer for a queue ticket (if customer doesn't show up in time)
export const startNoShowTimer = (queueId: string, agentId: string | null, timeoutMs: number = NO_SHOW_TIMEOUT_MS): void => {
    cancelNoShowTimer(queueId);

    const timer = setTimeout(async () => {
        pendingNoShows.delete(queueId);

        try {
            const queue = await Queue.findById(queueId);
            if (!queue) return;

            // Only process if still in "called" status (not shown up yet)
            if (queue.status !== "called") return;

            // Mark as cancelled (no-show)
            queue.status = "cancelled";
            queue.cancelledAt = new Date();
            await queue.save();

            // Notify the no-show customer
            await createAndEmitNotification({
                userId: queue.customer.toString(),
                type: "queue_cancelled",
                title: "Ticket skipped - No show",
                message: `Ticket ${queue.displayNumber} was cancelled because you did not arrive at the counter within 2 minutes.`,
                queueId: queue._id.toString(),
            });

            // Emit queue update
            const populated = await Queue.findById(queue._id)
                .populate("branch", "name location")
                .populate("department", "name prefix")
                .populate("customer", "name")
                .populate("agent");

            const queueBranchId = typeof queue.branch === "string" ? queue.branch : queue.branch._id.toString();
            const queueDeptId = typeof queue.department === "string" ? queue.department : queue.department._id.toString();

            const { emitQueueUpdated } = await import("../sockets/emitter.js");
            emitQueueUpdated(toQueueData(populated!), queueBranchId, queueDeptId);

            // Emit no-show event
            emitQueueNoShow({
                queueId: queue._id.toString(),
                displayNumber: queue.displayNumber,
                agentId: agentId ?? "",
                departmentId: queueDeptId,
                branchId: queueBranchId,
                message: `Ticket ${queue.displayNumber} skipped - customer did not show up`,
            });

            // Set agent back to available (if agent was involved)
            if (agentId) {
                const agent = await Agent.findById(agentId);
                if (agent) {
                    agent.status = "available";
                    await agent.save();
                    const agentPopulated = await Agent.findById(agent._id)
                        .populate("user", "name email")
                        .populate("branch", "name location")
                        .populate("department", "name prefix");
                    emitAgentUpdated(toAgentData(agentPopulated!));
                }

                // Auto-call next if there are waiting tickets
                const waitingCount = await Queue.countDocuments({
                    department: queue.department,
                    date: today(),
                    status: "waiting",
                });

                if (waitingCount > 0 && agent && agent.isActive && agent.status === "available") {
                    scheduleAutoCallNext(agentId, AUTO_CALL_DELAY_MS);
                }
            }

            // Emit updated stats
            const stats = await getQueueStatsHelper();
            emitStatsUpdated(stats);
        } catch (error) {
            console.error(`No-show timer failed for queue ${queueId}:`, error);
        }
    }, timeoutMs);

    pendingNoShows.set(queueId, timer);
};

// Schedule auto-call next for an agent after a delay
// When a ticket is completed, the next waiting ticket is automatically called
export const scheduleAutoCallNext = (agentId: string, delayMs: number = AUTO_CALL_DELAY_MS): void => {
    // Cancel any existing pending auto-call for this agent
    cancelPendingAutoCall(agentId);

    const timer = setTimeout(async () => {
        pendingAutoCalls.delete(agentId);

        try {
            await ensureFreshCounters();

            const agent = await Agent.findById(agentId);
            if (!agent || !agent.isActive) return;
            if (agent.status === "busy") return; // still busy with another ticket
            if (!isWithinOfficeHours(agent.officeStart, agent.officeEnd)) return;
            if (agent.tokensServedToday >= agent.maxTokensPerDay) return;

            // Check if there are waiting tickets
            const waitingCount = await Queue.countDocuments({
                department: agent.department,
                date: today(),
                status: "waiting",
            });

            if (waitingCount === 0) return;

            // Notify admin room that auto-call is about to happen
            emitAutoCallNext(agentId, {
                departmentId: agent.department.toString(),
                waitingCount,
                delayMs: 0,
            });

            // Automatically call the next ticket
            await agentCallNext(agentId);
        } catch (error) {
            // Silently fail - auto-call is best-effort
            console.error(`Auto-call failed for agent ${agentId}:`, error);
        }
    }, delayMs);

    pendingAutoCalls.set(agentId, timer);
};

interface CreateAgentData {
    user: string;
    branch: string;
    department: string;
    counterNumber: number;
    officeStart?: number | undefined;
    officeEnd?: number | undefined;
    maxTokensPerDay?: number | undefined;
}

export const createAgent = async (data: CreateAgentData) => {
    if (
        !mongoose.Types.ObjectId.isValid(data.user) ||
        !mongoose.Types.ObjectId.isValid(data.branch) ||
        !mongoose.Types.ObjectId.isValid(data.department)
    ) {
        throw new Error("Invalid user, branch, or department ID");
    }

    const userExists = await User.findById(data.user);
    if (!userExists) {
        throw new Error("User not found");
    }

    const branchData = await Branch.findById(data.branch);
    if (!branchData) {
        throw new Error("Branch not found");
    }

    if (!branchData.isActive) {
        throw new Error("Branch is not active");
    }

    const departmentData = await Department.findById(data.department);
    if (!departmentData) {
        throw new Error("Department not found");
    }

    if (!departmentData.isActive) {
        throw new Error("Department is not active");
    }

    if (departmentData.branch.toString() !== data.branch) {
        throw new Error("Department does not belong to this branch");
    }

    const existing = await Agent.findOne({ user: data.user, department: data.department });
    if (existing) {
        throw new Error("Agent already exists for this user in this department");
    }

    const agent = await Agent.create({
        user: data.user,
        branch: data.branch,
        department: data.department,
        counterNumber: data.counterNumber,
        officeStart: data.officeStart ?? 9,
        officeEnd: data.officeEnd ?? 17,
        maxTokensPerDay: data.maxTokensPerDay ?? 20,
        tokensServedToday: 0,
        lastResetDate: today(),
        isActive: true,
        status: "available",
    });

    const populated = await Agent.findById(agent._id)
        .populate("user", "name email")
        .populate("branch", "name location")
        .populate("department", "name prefix");

    emitAgentUpdated(toAgentData(populated!));

    return agent;
};

export const getAllAgents = async () => {
    await ensureFreshCounters();
    return await Agent.find()
        .populate("user", "name email")
        .populate("branch", "name location")
        .populate("department", "name prefix")
        .sort({ createdAt: -1 });
};

export const getAgentById = async (agentId: string) => {
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
        throw new Error("Invalid agent ID");
    }

    await ensureFreshCounters();

    const agent = await Agent.findById(agentId)
        .populate("user", "name email")
        .populate("branch", "name location")
        .populate("department", "name prefix");

    if (!agent) {
        throw new Error("Agent not found");
    }

    return agent;
};

export const getAgentByUserId = async (userId: string) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID");
    }

    await ensureFreshCounters();

    const agents = await Agent.find({ user: userId, isActive: true })
        .populate("branch", "name location")
        .populate("department", "name prefix");

    return agents;
};

interface UpdateAgentData {
    counterNumber?: number | undefined;
    officeStart?: number | undefined;
    officeEnd?: number | undefined;
    maxTokensPerDay?: number | undefined;
    isActive?: boolean | undefined;
    status?: "available" | "busy" | "offline" | undefined;
}

export const updateAgent = async (agentId: string, data: UpdateAgentData) => {
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
        throw new Error("Invalid agent ID");
    }

    const agent = await Agent.findById(agentId);
    if (!agent) {
        throw new Error("Agent not found");
    }

    if (data.counterNumber !== undefined) agent.counterNumber = data.counterNumber;
    if (data.officeStart !== undefined) agent.officeStart = data.officeStart;
    if (data.officeEnd !== undefined) agent.officeEnd = data.officeEnd;
    if (data.maxTokensPerDay !== undefined) agent.maxTokensPerDay = data.maxTokensPerDay;
    if (data.isActive !== undefined) {
        agent.isActive = data.isActive;
        if (!data.isActive) {
            cancelPendingAutoCall(agentId);
            agent.status = "offline";
        }
    }
    if (data.status !== undefined) {
        agent.status = data.status;
        if (data.status === "offline") {
            cancelPendingAutoCall(agentId);
        }
    }

    await agent.save();

    const populated = await Agent.findById(agent._id)
        .populate("user", "name email")
        .populate("branch", "name location")
        .populate("department", "name prefix");

    emitAgentUpdated(toAgentData(populated!));

    return agent;
};

export const deleteAgent = async (agentId: string) => {
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
        throw new Error("Invalid agent ID");
    }

    cancelPendingAutoCall(agentId);

    const agent = await Agent.findByIdAndDelete(agentId);
    if (!agent) {
        throw new Error("Agent not found");
    }

    return { message: "Agent deleted successfully" };
};

export const getAgentsByDepartment = async (departmentId: string) => {
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
        throw new Error("Invalid department ID");
    }

    await ensureFreshCounters();

    return await Agent.find({ department: departmentId, isActive: true })
        .populate("user", "name email")
        .populate("branch", "name location")
        .populate("department", "name prefix");
};

// Reconcile agent statuses: any agent still marked "busy" but WITHOUT an
// active (called/serving) ticket assigned today is reset back to "available".
// A "busy" status is only valid while the agent is actually serving a customer.
// This fixes agents getting stuck "busy" forever (e.g. server restart before a
// no-show timer fired, a ticket cancelled mid-call, or a crash mid-flow).
export const reconcileAgentStatuses = async (): Promise<void> => {
    const date = today();

    const busyAgents = await Agent.find({ isActive: true, status: "busy" });

    for (const agent of busyAgents) {
        const activeCount = await Queue.countDocuments({
            agent: agent._id,
            date,
            status: { $in: ["called", "serving"] },
        });

        if (activeCount === 0) {
            agent.status = "available";
            await agent.save();

            const populated = await Agent.findById(agent._id)
                .populate("user", "name email")
                .populate("branch", "name location")
                .populate("department", "name prefix");
            emitAgentUpdated(toAgentData(populated!));
        }
    }
};

// Check if an agent can serve more tokens today
export const canServeMore = async (agentId: string): Promise<{ allowed: boolean; reason?: string }> => {
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
        throw new Error("Invalid agent ID");
    }

    await ensureFreshCounters();

    const agent = await Agent.findById(agentId);
    if (!agent) {
        throw new Error("Agent not found");
    }

    if (!agent.isActive) {
        return { allowed: false, reason: "Agent is not active" };
    }

    if (!isWithinOfficeHours(agent.officeStart, agent.officeEnd)) {
        return { allowed: false, reason: `Office hours are ${agent.officeStart}:00 - ${agent.officeEnd}:00` };
    }

    if (agent.tokensServedToday >= agent.maxTokensPerDay) {
        return { allowed: false, reason: `Daily token limit reached (${agent.maxTokensPerDay})` };
    }

    return { allowed: true };
};

// Increment tokens served for an agent
export const incrementTokensServed = async (agentId: string) => {
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
        throw new Error("Invalid agent ID");
    }

    await ensureFreshCounters();

    const agent = await Agent.findByIdAndUpdate(
        agentId,
        { $inc: { tokensServedToday: 1 } },
        { new: true }
    );

    if (agent) {
        const populated = await Agent.findById(agent._id)
            .populate("user", "name email")
            .populate("branch", "name location")
            .populate("department", "name prefix");
        emitAgentUpdated(toAgentData(populated!));

        if (agent.tokensServedToday >= agent.maxTokensPerDay) {
            cancelPendingAutoCall(agentId);
            agent.status = "offline";
            await agent.save();
            const offlinePopulated = await Agent.findById(agent._id)
                .populate("user", "name email")
                .populate("branch", "name location")
                .populate("department", "name prefix");
            emitAgentUpdated(toAgentData(offlinePopulated!));
        }
    }

    return agent;
};

// Get agent performance stats
export const getAgentStats = async () => {
    await ensureFreshCounters();

    // Free any agent that is stuck "busy" without an active ticket first, so
    // the dashboard always shows a truthful status.
    await reconcileAgentStatuses();

    const date = today();

    const agents = await Agent.find({ isActive: true })
        .populate("user", "name email")
        .populate("branch", "name location")
        .populate("department", "name prefix");

    const stats = await Promise.all(
        agents.map(async (agent) => {
            const totalServed = await Queue.countDocuments({
                agent: agent._id,
                date,
                status: { $in: ["completed", "serving"] },
            });

            const completedToday = await Queue.countDocuments({
                agent: agent._id,
                date,
                status: "completed",
            });

            const currentlyServing = await Queue.countDocuments({
                agent: agent._id,
                date,
                status: { $in: ["called", "serving"] },
            });

            return {
                agent: toAgentData(agent),
                totalServed,
                completedToday,
                currentlyServing,
                tokensRemaining: agent.maxTokensPerDay - agent.tokensServedToday,
                officeHoursActive: isWithinOfficeHours(agent.officeStart, agent.officeEnd),
            };
        })
    );

    return stats;
};

// Agent calls next customer in queue
export const agentCallNext = async (agentId: string) => {
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
        throw new Error("Invalid agent ID");
    }

    await ensureFreshCounters();

    const agent = await Agent.findById(agentId)
        .populate("department", "name prefix");

    if (!agent) {
        throw new Error("Agent not found");
    }

    if (!agent.isActive) {
        throw new Error("Agent is not active");
    }

    if (!isWithinOfficeHours(agent.officeStart, agent.officeEnd)) {
        throw new Error(`Office hours are ${agent.officeStart}:00 - ${agent.officeEnd}:00`);
    }

    if (agent.tokensServedToday >= agent.maxTokensPerDay) {
        throw new Error(`Daily token limit reached (${agent.maxTokensPerDay})`);
    }

    if (agent.status === "busy") {
        throw new Error("Agent is currently busy serving a customer");
    }

    const queue = await Queue.findOne({
        department: agent.department,
        date: today(),
        status: "waiting",
    })
        .sort({ ticketNumber: 1 })
        .populate("branch", "name location")
        .populate("department", "name prefix");

    if (!queue) {
        throw new Error("No waiting queues");
    }

    queue.status = "called";
    queue.calledAt = new Date();
    queue.counterNumber = agent.counterNumber;
    (queue as any).agent = agent._id;
    await queue.save();

    agent.status = "busy";
    await agent.save();

    const populated = await Queue.findById(queue._id)
        .populate("branch", "name location")
        .populate("department", "name prefix")
        .populate("customer", "name")
        .populate("agent");

    const queueBranchId = typeof queue.branch === "string" ? queue.branch : queue.branch._id.toString();
    const queueDeptId = typeof queue.department === "string" ? queue.department : queue.department._id.toString();

    const { emitQueueCalled } = await import("../sockets/emitter.js");
    emitQueueCalled(toQueueData(populated!), queueBranchId, queueDeptId);

    await createAndEmitNotification({
        userId: queue.customer.toString(),
        type: "queue_called",
        title: "It's your turn!",
        message: queue.counterNumber
            ? `Ticket ${queue.displayNumber} - please go to Counter ${queue.counterNumber}. You have 2 minutes to arrive.`
            : `Ticket ${queue.displayNumber} - please proceed to the counter. You have 2 minutes to arrive.`,
        queueId: queue._id.toString(),
    });

    // Start no-show timer: if customer doesn't show up in 2 minutes, skip them
    startNoShowTimer(queue._id.toString(), agentId, NO_SHOW_TIMEOUT_MS);

    const agentPopulated = await Agent.findById(agent._id)
        .populate("user", "name email")
        .populate("branch", "name location")
        .populate("department", "name prefix");
    emitAgentUpdated(toAgentData(agentPopulated!));

    const stats = await getQueueStatsHelper();
    emitStatsUpdated(stats);

    return queue;
};

// Agent completes a ticket - triggers auto-call next after delay
export const agentCompleteTicket = async (agentId: string, queueId: string) => {
    if (!mongoose.Types.ObjectId.isValid(agentId) || !mongoose.Types.ObjectId.isValid(queueId)) {
        throw new Error("Invalid agent or queue ID");
    }

    const agent = await Agent.findById(agentId);
    if (!agent) {
        throw new Error("Agent not found");
    }

    const queue = await Queue.findById(queueId);
    if (!queue) {
        throw new Error("Queue not found");
    }

    if (queue.status !== "called" && queue.status !== "serving") {
        throw new Error("Ticket is not in a callable/servable state");
    }

    // Customer showed up - cancel no-show timer
    cancelNoShowTimer(queueId);

    // Complete the ticket
    queue.status = "completed";
    queue.completedAt = new Date();
    await queue.save();

    // Increment agent's token count
    await incrementTokensServed(agentId);

    // Set agent back to available (if not at limit)
    const updatedAgent = await Agent.findById(agentId);
    if (updatedAgent && updatedAgent.tokensServedToday < updatedAgent.maxTokensPerDay) {
        updatedAgent.status = "available";
        await updatedAgent.save();

        const agentPopulated = await Agent.findById(agentId)
            .populate("user", "name email")
            .populate("branch", "name location")
            .populate("department", "name prefix");
        emitAgentUpdated(toAgentData(agentPopulated!));
    }

    const populated = await Queue.findById(queue._id)
        .populate("branch", "name location")
        .populate("department", "name prefix")
        .populate("customer", "name")
        .populate("agent");

    const queueBranchId = typeof queue.branch === "string" ? queue.branch : queue.branch._id.toString();
    const queueDeptId = typeof queue.department === "string" ? queue.department : queue.department._id.toString();

    const { emitQueueUpdated } = await import("../sockets/emitter.js");
    emitQueueUpdated(toQueueData(populated!), queueBranchId, queueDeptId);

    await createAndEmitNotification({
        userId: queue.customer.toString(),
        type: "queue_completed",
        title: "Visit complete",
        message: `Ticket ${queue.displayNumber} is completed. Thank you!`,
        queueId: queue._id.toString(),
    });

    const stats = await getQueueStatsHelper();
    emitStatsUpdated(stats);

    // Check if there are waiting tickets - schedule auto-call if so
    const waitingCount = await Queue.countDocuments({
        department: agent.department,
        date: today(),
        status: "waiting",
    });

    if (waitingCount > 0 && updatedAgent && updatedAgent.isActive && updatedAgent.status === "available") {
        // Notify admin that auto-call is scheduled
        emitAutoCallNext(agentId, {
            departmentId: agent.department.toString(),
            waitingCount,
            delayMs: AUTO_CALL_DELAY_MS,
        });

        // Schedule auto-call after delay
        scheduleAutoCallNext(agentId, AUTO_CALL_DELAY_MS);
    }

    return queue;
};

// Helper: get queue stats
const getQueueStatsHelper = async () => {
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

// Helper: convert agent to socket-safe data
export const toAgentData = (agent: InstanceType<typeof Agent>): AgentData => {
    const userRaw = agent.user as unknown as mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; name: string; email?: string };
    const branchRaw = agent.branch as unknown as mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; name: string; location?: string };
    const departmentRaw = agent.department as unknown as mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; name: string; prefix?: string };

    const userData: AgentData["user"] = userRaw && typeof userRaw === "object" && "name" in userRaw
        ? { _id: (userRaw._id as mongoose.Types.ObjectId).toString(), name: userRaw.name, ...(userRaw.email !== undefined ? { email: userRaw.email } : {}) }
        : userRaw.toString();

    const branchData: AgentData["branch"] = branchRaw && typeof branchRaw === "object" && "name" in branchRaw
        ? { _id: (branchRaw._id as mongoose.Types.ObjectId).toString(), name: branchRaw.name, ...(branchRaw.location !== undefined ? { location: branchRaw.location } : {}) }
        : branchRaw.toString();

    const departmentData: AgentData["department"] = departmentRaw && typeof departmentRaw === "object" && "name" in departmentRaw
        ? { _id: (departmentRaw._id as mongoose.Types.ObjectId).toString(), name: departmentRaw.name, ...(departmentRaw.prefix !== undefined ? { prefix: departmentRaw.prefix } : {}) }
        : departmentRaw.toString();

    return {
        _id: agent._id.toString(),
        user: userData,
        branch: branchData,
        department: departmentData,
        counterNumber: agent.counterNumber,
        officeStart: agent.officeStart,
        officeEnd: agent.officeEnd,
        maxTokensPerDay: agent.maxTokensPerDay,
        tokensServedToday: agent.tokensServedToday,
        isActive: agent.isActive,
        status: agent.status,
    };
};

// Helper: convert queue to socket-safe data (with agent field)
const toQueueData = (q: InstanceType<typeof Queue>) => {
    const branchRaw = q.branch as unknown as mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; name: string; location?: string };
    const departmentRaw = q.department as unknown as mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; name: string; prefix?: string };
    const customerRaw = q.customer as unknown as mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; name?: string };

    const branchData = branchRaw && typeof branchRaw === "object" && "name" in branchRaw
        ? { _id: (branchRaw._id as mongoose.Types.ObjectId).toString(), name: branchRaw.name, ...(branchRaw.location !== undefined ? { location: branchRaw.location } : {}) }
        : branchRaw.toString();
    const departmentData = departmentRaw && typeof departmentRaw === "object" && "name" in departmentRaw
        ? { _id: (departmentRaw._id as mongoose.Types.ObjectId).toString(), name: departmentRaw.name, ...(departmentRaw.prefix !== undefined ? { prefix: departmentRaw.prefix } : {}) }
        : departmentRaw.toString();
    const customerData = customerRaw && typeof customerRaw === "object" && "name" in customerRaw
        ? { _id: (customerRaw._id as mongoose.Types.ObjectId).toString(), name: customerRaw.name }
        : customerRaw.toString();

    const data: any = {
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

    const agentRaw = (q as any).agent;
    if (agentRaw) {
        if (typeof agentRaw === "object" && agentRaw.name) {
            data.agent = { _id: agentRaw._id?.toString() || agentRaw.toString(), name: agentRaw.name };
        } else if (typeof agentRaw === "object" && agentRaw.user) {
            const agentUser = agentRaw.user as any;
            data.agent = {
                _id: agentRaw._id?.toString(),
                name: agentUser.name || "Agent",
                counterNumber: agentRaw.counterNumber,
            };
        } else {
            data.agent = agentRaw.toString();
        }
    }

    return data;
};
