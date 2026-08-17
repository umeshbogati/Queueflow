import { z } from "zod";

export const createDepartmentSchema = z.object({
    name: z
        .string()
        .min(2, "Department name must be at least 2 characters")
        .max(100, "Department name must not exceed 100 characters"),

    branch: z
        .string()
        .min(1, "Branch ID is required"),

    description: z
        .string()
        .max(500, "Description must not exceed 500 characters")
        .optional(),

    isActive: z
        .boolean()
        .optional(),
});

export const updateDepartmentSchema = z.object({
    name: z
        .string()
        .min(2, "Department name must be at least 2 characters")
        .max(100, "Department name must not exceed 100 characters")
        .optional(),

    branch: z
        .string()
        .min(1, "Branch ID is required")
        .optional(),

    description: z
        .string()
        .max(500, "Description must not exceed 500 characters")
        .optional(),

    isActive: z
        .boolean()
        .optional(),
});