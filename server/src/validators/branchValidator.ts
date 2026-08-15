import { z } from "zod";

export const createBranchSchema = z.object({
    name: z
        .string()
        .min(2, "Branch name must be at least 2 characters")
        .max(100, "Branch name cannot exceed 100 characters")
        .trim(),
    location: z
        .string()
        .min(2, "Location must be at least 2 characters")
        .max(200, "Location cannot exceed 200 characters")
        .trim(),
});

export const updateBranchSchema = z.object({
    name: z
        .string()
        .min(2, "Branch name must be at least 2 characters")
        .max(100, "Branch name cannot exceed 100 characters")
        .trim()
        .optional(),
    location: z
        .string()
        .min(2, "Location must be at least 2 characters")
        .max(200, "Location cannot exceed 200 characters")
        .trim()
        .optional(),
    isActive: z.boolean().optional(),
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;