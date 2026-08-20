import { io } from "../server.js";
import { SOCKET_EVENTS, SOCKET_ROOMS } from "./socketEvents.js";
import type { QueueData, BranchData, DepartmentData, QueueStatsData } from "./socketTypes.js";

export const emitQueueCreated = (data: QueueData, branchId: string, departmentId: string) => {
    io.to(SOCKET_ROOMS.branch(branchId)).to(SOCKET_ROOMS.ADMIN).emit(SOCKET_EVENTS.QUEUE_CREATED, data);
    io.to(SOCKET_ROOMS.department(departmentId)).emit(SOCKET_EVENTS.QUEUE_CREATED, data);
};

export const emitQueueUpdated = (data: QueueData, branchId: string, departmentId: string) => {
    io.to(SOCKET_ROOMS.branch(branchId)).to(SOCKET_ROOMS.ADMIN).emit(SOCKET_EVENTS.QUEUE_UPDATED, data);
    io.to(SOCKET_ROOMS.department(departmentId)).emit(SOCKET_EVENTS.QUEUE_UPDATED, data);

    if (data.customer) {
        const customerId = typeof data.customer === "string" ? data.customer : (data.customer as { _id: string })._id;
        io.to(SOCKET_ROOMS.user(customerId)).emit(SOCKET_EVENTS.QUEUE_UPDATED, data);
    }
};

export const emitQueueCalled = (data: QueueData, branchId: string, departmentId: string) => {
    io.to(SOCKET_ROOMS.branch(branchId)).to(SOCKET_ROOMS.ADMIN).emit(SOCKET_EVENTS.QUEUE_CALLED, data);
    io.to(SOCKET_ROOMS.department(departmentId)).emit(SOCKET_EVENTS.QUEUE_CALLED, data);

    if (data.customer) {
        const customerId = typeof data.customer === "string" ? data.customer : (data.customer as { _id: string })._id;
        io.to(SOCKET_ROOMS.user(customerId)).emit(SOCKET_EVENTS.QUEUE_CALLED, data);
    }
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
