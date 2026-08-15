import { Router } from "express";
import {
    createBranchController,
    getAllBranchesController,
    getBranchByIdController,
    updateBranchController,
    deleteBranchController,
} from "../controllers/branchController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = Router();

// GET all branches & GET branch by ID
router.get("/", getAllBranchesController);
router.get("/:id", getBranchByIdController);

// POST, PUT, DELETE branches (Protected with Auth + Admin)
router.post("/", protect, adminOnly, createBranchController);
router.put("/:id", protect, adminOnly, updateBranchController);
router.delete("/:id", protect, adminOnly, deleteBranchController);

export default router;
