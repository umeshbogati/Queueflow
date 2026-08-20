import { z } from "zod";

export const createQueueSchema = z.object({
    branch: z.string()
    .min(1, "Branch ID is required"),

    department: z.string()
    .min(1, "Department ID is required"),
});

export const updateQueueStatusSchema = z.object({
    status: z.enum([
        "called",
        "serving",
        "completed",
        "cancelled",
    ]),
});