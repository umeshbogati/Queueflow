import { Router } from "express";
import { createQueueController, getAllQueuesController, getMyQueuesController, getQueueByIdController, updateQueueStatusController, callNextController, getQueueStatsController, deleteQueueController } from "../controllers/queueController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { createQueueSchema, updateQueueStatusSchema } from "../validators/queueValidator.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = Router();

router.get("/", protect, getAllQueuesController);
router.get("/stats", protect, adminOnly, getQueueStatsController);
router.get("/my", protect, getMyQueuesController);
router.get("/:id", protect, getQueueByIdController);
router.post("/", protect, validate(createQueueSchema), createQueueController);
router.patch("/call-next", protect, adminOnly, callNextController);
router.patch("/:id/status", protect, adminOnly, validate(updateQueueStatusSchema), updateQueueStatusController);
router.delete("/:id", protect, adminOnly, deleteQueueController);

export default router;

