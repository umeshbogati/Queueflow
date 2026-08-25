import { Router } from "express";
import {
    createAgentController,
    getAllAgentsController,
    getAgentByIdController,
    getAgentByUserIdController,
    getAgentsByDepartmentController,
    updateAgentController,
    deleteAgentController,
    getAgentStatsController,
    agentCallNextController,
    agentCompleteTicketController,
    canServeMoreController,
} from "../controllers/agentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { agentOnly } from "../middleware/agentMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { createAgentSchema, updateAgentSchema } from "../validators/agentValidator.js";

const router = Router();

router.get("/", protect, adminOnly, getAllAgentsController);
router.get("/stats", protect, adminOnly, getAgentStatsController);
router.get("/user/:userId", protect, getAgentByUserIdController);
router.get("/department/:departmentId", protect, getAgentsByDepartmentController);
router.get("/:id", protect, getAgentByIdController);
router.get("/:id/can-serve", protect, canServeMoreController);
router.post("/", protect, adminOnly, validate(createAgentSchema), createAgentController);
router.patch("/:id", protect, adminOnly, validate(updateAgentSchema), updateAgentController);
router.delete("/:id", protect, adminOnly, deleteAgentController);
router.patch("/:id/call-next", protect, agentOnly, agentCallNextController);
router.patch("/:id/complete", protect, agentOnly, agentCompleteTicketController);

export default router;
