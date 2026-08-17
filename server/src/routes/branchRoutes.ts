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

import {
    createBranchSchema,
    updateBranchSchema,
} from "../validators/branchValidator.js";

import { validate } from "../middleware/validateMiddleware.js";

const router: Router = Router();


// CREATE
router.post(
    "/",
    protect,
    adminOnly,
    validate(createBranchSchema),
    createBranchController
);


// GET ALL
router.get(
    "/",
    protect,
    getAllBranchesController
);


// GET ONE
router.get(
    "/:id",
    protect,
    getBranchByIdController
);


// UPDATE
router.put(
    "/:id",
    protect,
    adminOnly,
    validate(updateBranchSchema),
    updateBranchController
);


// DELETE
router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteBranchController
);


export default router;