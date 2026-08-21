import { z } from "zod";

export const createQueueSchema = z.object({
    branch: z.string()
    .min(1, "Branch ID is required"),

    department: z.string()
    .min(1, "Department ID is required"),
});

export const callNextSchema = z.object({
    counterNumber: z.number().int().positive().max(999).optional(),
    branchId: z.string().min(1).optional(),
    departmentId: z.string().min(1).optional(),
});

export const updateQueueStatusSchema = z.object({
    status: z.enum([
        "called",
        "serving",
        "completed",
        "cancelled",
    ]),

    counterNumber: z.number().int().positive().max(999).optional(),
});
