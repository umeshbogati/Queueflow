import type { Request, Response } from "express";

import {
    createBranch,
    getAllBranches,
    getBranchById,
    updateBranch,
    deleteBranch,
} from "../services/branchService.js";

// CREATE BRANCH
export const createBranchController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { name, location } = req.body;

        const branch = await createBranch(
            name,
            location
        );

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
        const id = req.params.id as string;

        const branch = await getBranchById(id);

        if (!branch) {
            res.status(404).json({
                success: false,
                message: "Branch not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: branch,
        });
    } catch (error: any) {
        res.status(400).json({
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
        const id = req.params.id as string;

        const {
            name,
            location,
            isActive,
        } = req.body;

        const branch = await updateBranch(
            id,
            name,
            location,
            isActive
        );

        res.status(200).json({
            success: true,
            message: "Branch updated successfully",
            data: branch,
        });
    } catch (error: any) {
        res.status(400).json({
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
        const id = req.params.id as string;

        await deleteBranch(id);

        res.status(200).json({
            success: true,
            message: "Branch deleted successfully",
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to delete branch",
        });
    }
};