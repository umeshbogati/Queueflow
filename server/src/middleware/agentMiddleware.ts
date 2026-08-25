import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.js";
import Agent from "../models/Agent.js";

// Middleware: check if the authenticated user is an active agent
export const agentOnly = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: "Authentication required",
        });
        return;
    }

    // Admins can bypass agent checks
    if (req.user.role === "admin") {
        next();
        return;
    }

    const agent = await Agent.findOne({
        user: req.user.id,
        isActive: true,
    });

    if (!agent) {
        res.status(403).json({
            success: false,
            message: "Agent access required",
        });
        return;
    }

    // Attach agent to request for downstream use
    (req as any).agent = agent;
    next();
};
