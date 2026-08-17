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

router.get("/", getAllDepartmentsController);

router.get("/:id", getDepartmentByIdController);

router.post(
    "/",
    protect,
    adminOnly,
    createDepartmentController
);

router.patch(
    "/:id",
    protect,
    adminOnly,
    updateDepartmentController
);

router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteDepartmentController
);

export default router;