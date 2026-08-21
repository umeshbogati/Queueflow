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
    // server pushes a new notification to this user's private room
    NOTIFICATION_NEW: "notification:new",
} as const;

export const SOCKET_EMIT = {
    JOIN_BRANCH: "join:branch",
    LEAVE_BRANCH: "leave:branch",
    JOIN_DEPARTMENT: "join:department",
    LEAVE_DEPARTMENT: "leave:department",
    JOIN_ADMIN: "join:admin",
    LEAVE_ADMIN: "leave:admin",
    JOIN_USER: "join:user",
    LEAVE_USER: "leave:user",
} as const;
