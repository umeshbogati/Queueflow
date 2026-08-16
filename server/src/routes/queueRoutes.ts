import { Router } from "express";
import {
    createQueueController,
    getMyQueuesController,
    getQueueByIdController,
    updateQueueStatusController,
} from "../controllers/queueController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", protect, createQueueController);
router.get("/my", protect, getMyQueuesController);
router.get("/my-queues", protect, getMyQueuesController);
router.get("/:id", protect, getQueueByIdController);
router.patch("/:id/status", protect, updateQueueStatusController);

export default router;
