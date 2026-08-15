import type { Request, Response } from "express";
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
                errors: validation.error.flatten(),
            });
            return;
        }

        const { name, branch, description, isActive } = validation.data;

        const department = await createDepartment(
            name,
            branch,
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

// GET ALL DEPARTMENTS
export const getAllDepartmentsController = async (
    _req: Request,
    res: Response
): Promise<void> => {
    try {
        const departments = await getDepartments();

        res.status(200).json({
            success: true,
            data: departments,
        });
    } catch (error: any) {
        res.status(500).json({
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
        const id = (req.params.id as string).trim();

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
        const id = (req.params.id as string).trim();

        const validation = updateDepartmentSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.flatten(),
            });
            return;
        }

        const department = await updateDepartment(id, validation.data);

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
        const id = (req.params.id as string).trim();

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
