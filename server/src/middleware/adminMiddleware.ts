import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.js";

export const adminOnly = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: "Authentication required",
        });
        return;
    }

    // Use .toLowerCase() so both "Admin" and "admin" work
    if (req.user.role.toLowerCase() !== "admin") {
        res.status(403).json({
            success: false,
            message: "Admin access required",
        });
        return;
    }

    next();
};