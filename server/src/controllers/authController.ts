import type { Request, Response }  from "express";
import {
    registerSchema,
    loginSchema,
} from "../validators/authValidator.js";
import {
    registerUser,
    loginUser,
} from "../services/authService.js";

export const register = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const validation = registerSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({
                 success: false,
                 message: "validation failed",
                 errors: validation.error.format(),
            });
            return;
        }
        const result = await registerUser(validation.data);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Registration failed";
        res.status(400).json({
            success: false,
            message,
        });
    }
};

export const login = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const validation = loginSchema.safeParse(req.body);
        if(!validation.success) {
            res.status(400).json({
                success: false,
                message: "validation failed",
                 errors: validation.error.format(),
            });
            return;
        }
        const result = await loginUser(validation.data);
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    } catch(error) {
        const message = error instanceof Error? error.message : "Login failed";
        res.status(401).json({
            success: false,
            message,
        });
    }
};