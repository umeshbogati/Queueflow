export const SOCKET_EVENTS = {
    QUEUE_CREATED: "queue:created",
    QUEUE_UPDATED: "queue:updated",
    QUEUE_CALLED: "queue:called",
    BRANCH_CREATED: "branch:created",
    BRANCH_UPDATED: "branch:updated",
    BRANCH_DELETED: "branch:deleted",
    DEPARTMENT_CREATED: "department:created",
    DEPARTMENT_UPDATED: "department:updated",
    DEPARTMENT_DELETED: "department:deleted",
    STATS_UPDATED: "stats:updated",
    // real-time push of a newly created notification to one user's private room
    NOTIFICATION_NEW: "notification:new",
} as const;

export const SOCKET_ROOMS = {
    ADMIN: "admin",
    branch: (branchId: string) => `branch:${branchId}`,
    department: (departmentId: string) => `department:${departmentId}`,
    user: (userId: string) => `user:${userId}`,
} as const;
