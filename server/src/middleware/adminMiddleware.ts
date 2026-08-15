import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types/auth.js";

export const adminOnly = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user || req.user.role?.toLowerCase() !== "admin") {
        res.status(403).json({
            success: false,
            message: "Access denied. Admins only.",
        });
        return;
    }
    next();
};
