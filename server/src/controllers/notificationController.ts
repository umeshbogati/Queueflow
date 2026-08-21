import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.js";
import {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} from "../services/notificationService.js";

// GET /api/notifications - my latest notifications
export const getMyNotificationsController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const notifications = await getMyNotifications(req.user.id);

        res.status(200).json({
            success: true,
            data: notifications,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch notifications",
        });
    }
};

// GET /api/notifications/unread-count - number for the bell badge
export const getUnreadCountController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const count = await getUnreadCount(req.user.id);

        res.status(200).json({
            success: true,
            data: { count },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch unread count",
        });
    }
};

// PATCH /api/notifications/:id/read - mark one as read
export const markAsReadController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const id = (req.params.id as string).trim();
        const notification = await markAsRead(req.user.id, id);

        res.status(200).json({
            success: true,
            message: "Notification marked as read",
            data: notification,
        });
    } catch (error: any) {
        const status = error.message === "Notification not found" ? 404 : 400;
        res.status(status).json({
            success: false,
            message: error.message || "Failed to mark notification as read",
        });
    }
};

// PATCH /api/notifications/read-all - "Mark all read" button
export const markAllAsReadController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const result = await markAllAsRead(req.user.id);

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} notification(s) marked as read`,
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to mark all as read",
        });
    }
};
