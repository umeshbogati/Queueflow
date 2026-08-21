import type { QueueStatus } from "../models/Queue.js";
import type { NotificationType } from "../models/Notification.js";

// Shape of a notification as it travels over the socket / REST API.
// (Plain JSON - ObjectIds are converted to strings before sending.)
export interface NotificationData {
    _id: string;
    user: string;
    type: NotificationType;
    title: string;
    message: string;
    queue?: string;
    isRead: boolean;
    createdAt: string;
}

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
    // fired to the private `user:{id}` room whenever a notification is created
    "notification:new": (data: NotificationData) => void;
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
