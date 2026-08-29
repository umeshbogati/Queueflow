import { io } from "../server.js";
import { SOCKET_EVENTS, SOCKET_ROOMS } from "./socketEvents.js";
import type { QueueData, BranchData, DepartmentData, QueueStatsData, QueuePositionData, NotificationData, AgentData, AutoCallNextData, NoShowData } from "./socketTypes.js";

// Queue events are broadcast to every connected client: the queue list is
// shown to admins and regular users alike, so no tab should need a manual
// refresh to see a new ticket or a status change.
export const emitQueueCreated = (data: QueueData) => {
    io.emit(SOCKET_EVENTS.QUEUE_CREATED, data);
};

export const emitQueueUpdated = (data: QueueData) => {
    io.emit(SOCKET_EVENTS.QUEUE_UPDATED, data);
};

export const emitQueueCalled = (data: QueueData) => {
    io.emit(SOCKET_EVENTS.QUEUE_CALLED, data);
};

export const emitBranchCreated = (data: BranchData) => {
    io.to(SOCKET_ROOMS.ADMIN).emit(SOCKET_EVENTS.BRANCH_CREATED, data);
};

export const emitBranchUpdated = (data: BranchData) => {
    io.to(SOCKET_ROOMS.branch(data._id)).emit(SOCKET_EVENTS.BRANCH_UPDATED, data);
    io.to(SOCKET_ROOMS.ADMIN).emit(SOCKET_EVENTS.BRANCH_UPDATED, data);
};

export const emitBranchDeleted = (_id: string) => {
    io.to(SOCKET_ROOMS.branch(_id)).emit(SOCKET_EVENTS.BRANCH_DELETED, { _id });
    io.to(SOCKET_ROOMS.ADMIN).emit(SOCKET_EVENTS.BRANCH_DELETED, { _id });
};

export const emitDepartmentCreated = (data: DepartmentData) => {
    const branchId = typeof data.branch === "string" ? data.branch : data.branch._id;
    io.to(SOCKET_ROOMS.branch(branchId)).to(SOCKET_ROOMS.ADMIN).emit(SOCKET_EVENTS.DEPARTMENT_CREATED, data);
};

export const emitDepartmentUpdated = (data: DepartmentData) => {
    const branchId = typeof data.branch === "string" ? data.branch : data.branch._id;
    io.to(SOCKET_ROOMS.branch(branchId)).to(SOCKET_ROOMS.ADMIN).emit(SOCKET_EVENTS.DEPARTMENT_UPDATED, data);
    io.to(SOCKET_ROOMS.department(data._id)).emit(SOCKET_EVENTS.DEPARTMENT_UPDATED, data);
};

export const emitDepartmentDeleted = (_id: string) => {
    io.to(SOCKET_ROOMS.ADMIN).emit(SOCKET_EVENTS.DEPARTMENT_DELETED, { _id });
};

export const emitStatsUpdated = (data: QueueStatsData) => {
    io.to(SOCKET_ROOMS.ADMIN).emit(SOCKET_EVENTS.STATS_UPDATED, data);
};

// Push a freshly created notification to the recipient's private room.
// The socket is joined to `user:{id}` automatically on connect (socket.ts),
// so no client-side join is needed for personal delivery.
export const emitNotificationCreated = (data: NotificationData, userId: string) => {
    io.to(SOCKET_ROOMS.user(userId)).emit(SOCKET_EVENTS.NOTIFICATION_NEW, data);
};

// Push one waiting customer's live spot in the line to their private room.
export const emitQueuePosition = (data: QueuePositionData, userId: string) => {
    io.to(SOCKET_ROOMS.user(userId)).emit(SOCKET_EVENTS.QUEUE_POSITION, data);
};

// Emit agent status/data changes to admin room
export const emitAgentUpdated = (data: AgentData) => {
    io.to(SOCKET_ROOMS.ADMIN).emit(SOCKET_EVENTS.AGENT_UPDATED, data);
};

// Emit auto-call next countdown to admin room
export const emitAutoCallNext = (agentId: string, data: Omit<AutoCallNextData, "agentId">) => {
    io.to(SOCKET_ROOMS.ADMIN).emit(SOCKET_EVENTS.AUTO_CALL_NEXT, { ...data, agentId });
};

// Emit no-show event to admin, branch, and department rooms
export const emitQueueNoShow = (data: NoShowData) => {
    io.to(SOCKET_ROOMS.ADMIN).emit(SOCKET_EVENTS.QUEUE_NO_SHOW, data);
    io.to(SOCKET_ROOMS.branch(data.branchId)).emit(SOCKET_EVENTS.QUEUE_NO_SHOW, data);
    io.to(SOCKET_ROOMS.department(data.departmentId)).emit(SOCKET_EVENTS.QUEUE_NO_SHOW, data);
};
