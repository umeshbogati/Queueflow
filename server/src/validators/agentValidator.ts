import { z } from "zod";

export const createAgentSchema = z.object({
    user: z.string().min(1, "User ID is required"),
    branch: z.string().min(1, "Branch ID is required"),
    department: z.string().min(1, "Department ID is required"),
    counterNumber: z.number().int().positive().max(999),
    officeStart: z.number().int().min(0).max(23).optional(),
    officeEnd: z.number().int().min(0).max(23).optional(),
    maxTokensPerDay: z.number().int().positive().optional(),
});

export const updateAgentSchema = z.object({
    counterNumber: z.number().int().positive().max(999).optional(),
    officeStart: z.number().int().min(0).max(23).optional(),
    officeEnd: z.number().int().min(0).max(23).optional(),
    maxTokensPerDay: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
    status: z.enum(["available", "busy", "offline"]).optional(),
});
