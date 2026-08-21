import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import type { NotificationType } from "../models/Notification.js";
import { emitNotificationCreated } from "../sockets/emitter.js";
import type { NotificationData } from "../sockets/socketTypes.js";

// Helper to convert a Mongoose document to a plain object suitable for sending over the socket
const toNotificationData = (n: InstanceType<typeof Notification>): NotificationData => ({
    _id: n._id.toString(),
    user: n.user.toString(),
    type: n.type,
    title: n.title,
    message: n.message,
    ...(n.queue ? { queue: n.queue.toString() } : {}),
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
});

interface CreateNotificationData {
    userId: string;              // who receives it
    type: NotificationType;
    title: string;
    message: string;
    queueId?: string;            // optional related ticket
}

// Creates a new notification in the database and emits it to the user via socket.io
export const createAndEmitNotification = async ({
    userId,
    type,
    title,
    message,
    queueId,
}: CreateNotificationData): Promise<void> => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID");
    }

    // 1) Persist first - this is the source of truth
    const notification = await Notification.create({
        user: userId,
        type,
        title,
        message,
        ...(queueId ? { queue: queueId } : {}),
    });

    // 2) Then push real-time. If the user is offline right now,
    //    no problem - they'll fetch it via GET /api/notifications on next load.
    emitNotificationCreated(toNotificationData(notification), userId);
};

/** Latest 20 notifications for the logged-in user, newest first. */
export const getMyNotifications = async (userId: string) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID");
    }

    return await Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(20);
};

/** Number of unread notifications - powers the red badge on the bell. */
export const getUnreadCount = async (userId: string) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID");
    }

    return await Notification.countDocuments({ user: userId, isRead: false });
};

/** Mark ONE notification as read (scoped to the owner so users can't touch each other's). */
export const markAsRead = async (userId: string, notificationId: string) => {
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        throw new Error("Invalid notification ID");
    }

    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { isRead: true },
        { returnDocument: "after" }
    );

    if (!notification) {
        throw new Error("Notification not found");
    }

    return notification;
};

/** Mark EVERY unread notification of this user as read ("Mark all" button). */
export const markAllAsRead = async (userId: string) => {
    const result = await Notification.updateMany(
        { user: userId, isRead: false },
        { isRead: true }
    );

    return { modifiedCount: result.modifiedCount };
};
