import { Router } from "express";
import {
    createDepartmentController,
    getAllDepartmentsController,
    getDepartmentByIdController,
    updateDepartmentController,
    deleteDepartmentController,
} from "../controllers/departmentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = Router();

// GET all departments & GET department by ID
router.get("/", getAllDepartmentsController);
router.get("/:id", getDepartmentByIdController);

// POST, PUT, PATCH, DELETE departments (Protected with Auth + Admin)
router.post("/", protect, adminOnly, createDepartmentController);
router.put("/:id", protect, adminOnly, updateDepartmentController);
router.patch("/:id", protect, adminOnly, updateDepartmentController);
router.delete("/:id", protect, adminOnly, deleteDepartmentController);

export default router;
