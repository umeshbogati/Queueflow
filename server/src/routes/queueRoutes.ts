import { Router } from "express";
import { createQueueController, getMyQueuesController, getQueueByIdController, updateQueueStatusController } from "../controllers/queueController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { createQueueSchema, updateQueueStatusSchema } from "../validators/queueValidator.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = Router();

router.post("/", protect, validate(createQueueSchema), createQueueController);
router.get("/my", protect, getMyQueuesController);
router.patch("/:id/status", protect, adminOnly, validate(updateQueueStatusSchema), updateQueueStatusController);

export default router;

