import { z } from "zod";
export const createBranchSchema = z.object({
    name: z
    .string()
    .min(2, "Branch name must be at least 2 characters")
    .max(100, "Branch name cannot exceed 100 characters"),

    location: z
    .string()
    .min(2, "Location must be at least 2 characters")
    .max(200, "Location cannot exceed 200 characters"),
});

export const updateBranchSchema = z.object({
    name: z.string()
    .min(2, "Branch name must be at least 2 characters")
    .max(100, "Branch name cannot exceed 100 characters")
    .optional(),

    location: z.string()
    .min(2, "Location must be at least 2 characters")
    .max(200, "Location cannot exceed 200 characters")
    .optional(),

    isActive: z.boolean()
    .optional(),
});
