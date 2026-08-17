import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.js";
import {
    createQueue,
    getMyQueues,
    getQueueById,
    updateQueueStatus,
} from "../services/queueService.js";
import {
    createQueueSchema,
    updateQueueStatusSchema,
} from "../validators/queueValidator.js";

// CREATE QUEUE
export const createQueueController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user?.id) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }

        const validation = createQueueSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.flatten(),
            });
            return;
        }

        const { branch, department } = validation.data;

        const queue = await createQueue({
            branch,
            department,
            customer: req.user.id,
        });

        res.status(201).json({
            success: true,
            message: "Queue created successfully",
            data: queue,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to create queue",
        });
    }
};

// GET MY QUEUES
export const getMyQueuesController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user?.id) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }

        const queues = await getMyQueues(req.user.id);

        res.status(200).json({
            success: true,
            data: queues,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch queues",
        });
    }
};

// GET QUEUE BY ID
export const getQueueByIdController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const id = (req.params.id as string).trim();

        const queue = await getQueueById(id);

        res.status(200).json({
            success: true,
            data: queue,
        });
    } catch (error: any) {
        const status = error.message === "Queue not found" ? 404 : 400;
        res.status(status).json({
            success: false,
            message: error.message || "Failed to fetch queue",
        });
    }
};

// UPDATE QUEUE STATUS
export const updateQueueStatusController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const id = (req.params.id as string).trim();

        const validation = updateQueueStatusSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.flatten(),
            });
            return;
        }

        const queue = await updateQueueStatus(id, validation.data.status);

        res.status(200).json({
            success: true,
            message: "Queue status updated successfully",
            data: queue,
        });
    } catch (error: any) {
        const status = error.message === "Queue not found" ? 404 : 400;
        res.status(status).json({
            success: false,
            message: error.message || "Failed to update queue status",
        });
    }
};