import { z } from "zod";

export const createQueueSchema = z.object({
    branch: z.string().min(1, "Branch ID is required").trim(),
    department: z.string().min(1, "Department ID is required").trim(),
});

export const updateQueueStatusSchema = z.object({
    status: z.enum(["called", "serving", "completed", "cancelled"], {
        message: "Status must be called, serving, completed, or cancelled",
    }),
});

export type CreateQueueInput = z.infer<typeof createQueueSchema>;
export type UpdateQueueStatusInput = z.infer<typeof updateQueueStatusSchema>;
