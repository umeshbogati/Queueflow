import { Router } from "express";
import {
    getMyNotificationsController,
    getUnreadCountController,
    markAsReadController,
    markAllAsReadController,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();
router.get("/", protect, getMyNotificationsController);
router.get("/unread-count", protect, getUnreadCountController);
router.patch("/read-all", protect, markAllAsReadController);
router.patch("/:id/read", protect, markAsReadController);

export default router;
