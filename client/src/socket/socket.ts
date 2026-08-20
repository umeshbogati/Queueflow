import { io } from "socket.io-client";
import { SOCKET_EVENTS, SOCKET_EMIT } from "./socketEvents";
import type { Queue, QueueStats } from "../api/queueApi";
import type { Branch } from "../api/branchApi";
import type { Department } from "../api/departmentApi";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket", "polling"],
});

export const connectSocket = () => {
    if (!socket.connected) {
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};

export const joinBranch = (branchId: string) => {
    socket.emit(SOCKET_EMIT.JOIN_BRANCH, branchId);
};

export const leaveBranch = (branchId: string) => {
    socket.emit(SOCKET_EMIT.LEAVE_BRANCH, branchId);
};

export const joinDepartment = (departmentId: string) => {
    socket.emit(SOCKET_EMIT.JOIN_DEPARTMENT, departmentId);
};

export const leaveDepartment = (departmentId: string) => {
    socket.emit(SOCKET_EMIT.LEAVE_DEPARTMENT, departmentId);
};

export const joinAdmin = () => {
    socket.emit(SOCKET_EMIT.JOIN_ADMIN);
};

export const leaveAdmin = () => {
    socket.emit(SOCKET_EMIT.LEAVE_ADMIN);
};

export const joinUser = (userId: string) => {
    socket.emit(SOCKET_EMIT.JOIN_USER, userId);
};

export const leaveUser = (userId: string) => {
    socket.emit(SOCKET_EMIT.LEAVE_USER, userId);
};

export const onQueueCreated = (callback: (data: Queue) => void) => {
    socket.on(SOCKET_EVENTS.QUEUE_CREATED, callback);
    return () => { socket.off(SOCKET_EVENTS.QUEUE_CREATED, callback); };
};

export const onQueueUpdated = (callback: (data: Queue) => void) => {
    socket.on(SOCKET_EVENTS.QUEUE_UPDATED, callback);
    return () => { socket.off(SOCKET_EVENTS.QUEUE_UPDATED, callback); };
};

export const onQueueCalled = (callback: (data: Queue) => void) => {
    socket.on(SOCKET_EVENTS.QUEUE_CALLED, callback);
    return () => { socket.off(SOCKET_EVENTS.QUEUE_CALLED, callback); };
};

export const onBranchCreated = (callback: (data: Branch) => void) => {
    socket.on(SOCKET_EVENTS.BRANCH_CREATED, callback);
    return () => { socket.off(SOCKET_EVENTS.BRANCH_CREATED, callback); };
};

export const onBranchUpdated = (callback: (data: Branch) => void) => {
    socket.on(SOCKET_EVENTS.BRANCH_UPDATED, callback);
    return () => { socket.off(SOCKET_EVENTS.BRANCH_UPDATED, callback); };
};

export const onBranchDeleted = (callback: (data: { _id: string }) => void) => {
    socket.on(SOCKET_EVENTS.BRANCH_DELETED, callback);
    return () => { socket.off(SOCKET_EVENTS.BRANCH_DELETED, callback); };
};

export const onDepartmentCreated = (callback: (data: Department) => void) => {
    socket.on(SOCKET_EVENTS.DEPARTMENT_CREATED, callback);
    return () => { socket.off(SOCKET_EVENTS.DEPARTMENT_CREATED, callback); };
};

export const onDepartmentUpdated = (callback: (data: Department) => void) => {
    socket.on(SOCKET_EVENTS.DEPARTMENT_UPDATED, callback);
    return () => { socket.off(SOCKET_EVENTS.DEPARTMENT_UPDATED, callback); };
};

export const onDepartmentDeleted = (callback: (data: { _id: string }) => void) => {
    socket.on(SOCKET_EVENTS.DEPARTMENT_DELETED, callback);
    return () => { socket.off(SOCKET_EVENTS.DEPARTMENT_DELETED, callback); };
};

export const onStatsUpdated = (callback: (data: QueueStats) => void) => {
    socket.on(SOCKET_EVENTS.STATS_UPDATED, callback);
    return () => { socket.off(SOCKET_EVENTS.STATS_UPDATED, callback); };
};
