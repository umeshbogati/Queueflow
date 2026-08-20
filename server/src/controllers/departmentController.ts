import type { Request, Response } from "express";
import mongoose from "mongoose";
import {
    createDepartment,
    getDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
} from "../services/departmentService.js";
import {
    createDepartmentSchema,
    updateDepartmentSchema,
} from "../validators/departmentValidator.js";

// CREATE DEPARTMENT
export const createDepartmentController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const validation = createDepartmentSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                 errors: validation.error.format(),
            });
            return;
        }

        const { name, branch, prefix, description, isActive } = validation.data;

        const department = await createDepartment(
            name,
            branch,
            prefix,
            description,
            isActive
        );

        res.status(201).json({
            success: true,
            message: "Department created successfully",
            data: department,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to create department",
        });
    }
};

// GET ALL DEPARTMENTS (Supports optional ?branch=branchId filter)
export const getAllDepartmentsController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const branchId = typeof req.query.branch === "string" ? req.query.branch.trim() : undefined;
        const departments = await getDepartments(branchId);

        res.status(200).json({
            success: true,
            data: departments,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to get departments",
        });
    }
};

// GET DEPARTMENT BY ID
export const getDepartmentByIdController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const id = typeof req.params.id === "string" ? req.params.id.trim() : "";

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid department ID",
            });
            return;
        }

        const department = await getDepartmentById(id);

        res.status(200).json({
            success: true,
            data: department,
        });
    } catch (error: any) {
        const status = error.message === "Department not found" ? 404 : 400;
        res.status(status).json({
            success: false,
            message: error.message || "Failed to get department",
        });
    }
};

// UPDATE DEPARTMENT
export const updateDepartmentController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const id = typeof req.params.id === "string" ? req.params.id.trim() : "";

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid department ID",
            });
            return;
        }

        const validation = updateDepartmentSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                 errors: validation.error.format(),
            });
            return;
        }

        const raw = validation.data;
        const data: {
            name?: string;
            prefix?: string;
            branch?: string;
            description?: string;
            isActive?: boolean;
        } = {};
        for (const [key, value] of Object.entries(raw)) {
            if (value !== undefined) {
                (data as Record<string, unknown>)[key] = value;
            }
        }

        const department = await updateDepartment(id, data);

        res.status(200).json({
            success: true,
            message: "Department updated successfully",
            data: department,
        });
    } catch (error: any) {
        const status = error.message === "Department not found" ? 404 : 400;
        res.status(status).json({
            success: false,
            message: error.message || "Failed to update department",
        });
    }
};

// DELETE DEPARTMENT
export const deleteDepartmentController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const id = typeof req.params.id === "string" ? req.params.id.trim() : "";

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid department ID",
            });
            return;
        }

        const result = await deleteDepartment(id);

        res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error: any) {
        const status = error.message === "Department not found" ? 404 : 400;
        res.status(status).json({
            success: false,
            message: error.message || "Failed to delete department",
        });
    }
};