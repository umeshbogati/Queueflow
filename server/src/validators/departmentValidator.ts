import { z } from "zod";

export const createDepartmentSchema = z.object({
    name: z
        .string()
        .min(2, "Department name must be at least 2 characters")
        .max(100, "Department name cannot exceed 100 characters")
        .trim(),
    branch: z
        .string()
        .min(1, "Branch ID is required")
        .trim(),
    description: z
        .string()
        .max(500, "Description cannot exceed 500 characters")
        .trim()
        .optional(),
    isActive: z.boolean().optional(),
});

export const updateDepartmentSchema = z.object({
    name: z
        .string()
        .min(2, "Department name must be at least 2 characters")
        .max(100, "Department name cannot exceed 100 characters")
        .trim()
        .optional(),
    branch: z
        .string()
        .min(1, "Branch ID cannot be empty")
        .trim()
        .optional(),
    description: z
        .string()
        .max(500, "Description cannot exceed 500 characters")
        .trim()
        .optional(),
    isActive: z.boolean().optional(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
