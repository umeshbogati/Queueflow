import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Department name is required"),

  branch: z
    .string()
    .trim()
    .min(1, "Branch is required"),

  prefix: z
    .string()
    .trim()
    .max(10, "Prefix must be 10 characters or less")
    .optional(),

  description: z
    .string()
    .trim()
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

export const updateDepartmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Department name is required")
    .optional(),

  branch: z
    .string()
    .trim()
    .min(1, "Branch is required")
    .optional(),

  prefix: z
    .string()
    .trim()
    .max(10, "Prefix must be 10 characters or less")
    .optional(),

  description: z
    .string()
    .trim()
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});