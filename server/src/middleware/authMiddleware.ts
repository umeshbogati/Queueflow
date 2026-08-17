import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import type { AuthenticatedRequest } from "../types/auth.js";

interface JwtPayload {
    id: string;
    role: "user" | "admin";
}

export const protect = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization) {
            res.status(401).json({
                success: false,
                message: "Authorization required",
            });
            return;
        }

        const authHeader = authorization.trim();

        // Accepts both 'Bearer <token>' and 'bearer <token>' with any whitespace
        if (!/^Bearer\s+/i.test(authHeader)) {
            res.status(401).json({
                success: false,
                message: "Invalid authorization format. Expected 'Bearer <token>'",
            });
            return;
        }

        const token = authHeader.split(/\s+/)[1];
        if (!token) {
            res.status(401).json({ success: false, message: "Token not provided" });
            return;
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            res.status(500).json({
                success: false,
                message: "JWT_SECRET is not configured",
            });
            return;
        }

        const decoded = jwt.verify(token, secret) as JwtPayload;

        req.user = {
            id: decoded.id,
            role: decoded.role,
        };

        next();
    } catch {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};