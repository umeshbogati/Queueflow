import api from "./axios";

// A notification as returned by GET /api/notifications and pushed via socket.
export interface Notification {
  _id: string;
  user: string;
  type: "queue_called" | "queue_serving" | "queue_completed" | "queue_cancelled";
  title: string;
  message: string;
  queue?: string;
  isRead: boolean;
  createdAt: string;
}

// Latest 20 notifications for the logged-in user
export const getMyNotifications = async () => {
  const response = await api.get("/notifications");
  return response.data;
};

// Unread count for the bell badge
export const getUnreadCount = async () => {
  const response = await api.get("/notifications/unread-count");
  return response.data;
};

// Mark a single notification as read
export const markNotificationRead = async (id: string) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

// Mark every notification as read
export const markAllNotificationsRead = async () => {
  const response = await api.patch("/notifications/read-all");
  return response.data;
};
