import type { Request, Response } from "express";
import mongoose from "mongoose";
import {
    createBranch,
    getAllBranches,
    getBranchById,
    updateBranch,
    deleteBranch,
} from "../services/branchService.js";
import {
    createBranchSchema,
    updateBranchSchema,
} from "../validators/branchValidator.js";

// CREATE BRANCH
export const createBranchController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const validation = createBranchSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.flatten(),
            });
            return;
        }

        const { name, location } = validation.data;

        const branch = await createBranch(name, location);

        res.status(201).json({
            success: true,
            message: "Branch created successfully",
            data: branch,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to create branch",
        });
    }
};

// GET ALL BRANCHES
export const getAllBranchesController = async (
    _req: Request,
    res: Response
): Promise<void> => {
    try {
        const branches = await getAllBranches();

        res.status(200).json({
            success: true,
            data: branches,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to get branches",
        });
    }
};

// GET BRANCH BY ID
export const getBranchByIdController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const id = typeof req.params.id === "string" ? req.params.id.trim() : "";

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid branch ID",
            });
            return;
        }

        const branch = await getBranchById(id);

        res.status(200).json({
            success: true,
            data: branch,
        });
    } catch (error: any) {
        const status = error.message === "Branch not found" ? 404 : 400;
        res.status(status).json({
            success: false,
            message: error.message || "Failed to get branch",
        });
    }
};

// UPDATE BRANCH
export const updateBranchController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const id = typeof req.params.id === "string" ? req.params.id.trim() : "";

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid branch ID",
            });
            return;
        }

        const validation = updateBranchSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.flatten(),
            });
            return;
        }

        const { name, location, isActive } = validation.data;

        const branch = await updateBranch(id, name, location, isActive);

        res.status(200).json({
            success: true,
            message: "Branch updated successfully",
            data: branch,
        });
    } catch (error: any) {
        const status = error.message === "Branch not found" ? 404 : 400;
        res.status(status).json({
            success: false,
            message: error.message || "Failed to update branch",
        });
    }
};

// DELETE BRANCH
export const deleteBranchController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const id = typeof req.params.id === "string" ? req.params.id.trim() : "";

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid branch ID",
            });
            return;
        }

        const result = await deleteBranch(id);

        res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error: any) {
        const status = error.message === "Branch not found" ? 404 : 400;
        res.status(status).json({
            success: false,
            message: error.message || "Failed to delete branch",
        });
    }
};