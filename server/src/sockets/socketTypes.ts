import type { QueueStatus } from "../models/Queue.js";

export interface QueueData {
    _id: string;
    ticketNumber: number;
    displayNumber: string;
    branch: string | { _id: string; name: string; location?: string };
    department: string | { _id: string; name: string; prefix?: string };
    customer: string | { _id: string; name?: string };
    status: QueueStatus;
    date: string;
    counterNumber?: number;
    calledAt?: Date;
    servingAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
}

export interface BranchData {
    _id: string;
    name: string;
    location: string;
    isActive: boolean;
}

export interface DepartmentData {
    _id: string;
    name: string;
    branch: string | { _id: string; name: string };
    prefix?: string;
    description?: string;
    isActive: boolean;
}

export interface QueueStatsData {
    total: number;
    waiting: number;
    called: number;
    serving: number;
    completed: number;
    cancelled: number;
}

export interface ServerToClientEvents {
    "queue:created": (data: QueueData) => void;
    "queue:updated": (data: QueueData) => void;
    "queue:called": (data: QueueData) => void;
    "branch:created": (data: BranchData) => void;
    "branch:updated": (data: BranchData) => void;
    "branch:deleted": (data: { _id: string }) => void;
    "department:created": (data: DepartmentData) => void;
    "department:updated": (data: DepartmentData) => void;
    "department:deleted": (data: { _id: string }) => void;
    "stats:updated": (data: QueueStatsData) => void;
}

export interface ClientToServerEvents {
    "join:branch": (branchId: string) => void;
    "leave:branch": (branchId: string) => void;
    "join:department": (departmentId: string) => void;
    "leave:department": (departmentId: string) => void;
    "join:admin": () => void;
    "leave:admin": () => void;
    "join:user": (userId: string) => void;
    "leave:user": (userId: string) => void;
}
