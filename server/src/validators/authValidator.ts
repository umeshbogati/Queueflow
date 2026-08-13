import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .trim(),

    email: z.string().email("Please provide a valid email")
    .trim()
    .toLowerCase(),

    password: z.string().min(6, "Password must be at least 6 character")
    .max(100, "Password cannot exceed 100 character"),
});

export const loginSchema = z.object({
    email: z.string().email("Please provide a valid email")
    .trim()
    .toLowerCase(),

    password: z.string().min(1, "password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type loginInput = z.infer<typeof loginSchema>;