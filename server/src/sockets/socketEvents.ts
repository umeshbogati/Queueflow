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
    // live position of a waiting ticket, pushed to its owner's private room
    QUEUE_POSITION: "queue:position",
    // real-time push of a newly created notification to one user's private room
    NOTIFICATION_NEW: "notification:new",
    // agent status/data changes
    AGENT_UPDATED: "agent:updated",
    // agent stats updates
    AGENT_STATS: "agent:stats",
    // auto-call next countdown notification
    AUTO_CALL_NEXT: "auto:call-next",
    // customer no-show: ticket skipped, next customer called
    QUEUE_NO_SHOW: "queue:no-show",
} as const;

export const SOCKET_ROOMS = {
    ADMIN: "admin",
    branch: (branchId: string) => `branch:${branchId}`,
    department: (departmentId: string) => `department:${departmentId}`,
    user: (userId: string) => `user:${userId}`,
} as const;
