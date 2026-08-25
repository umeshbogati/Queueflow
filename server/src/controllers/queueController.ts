import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.js";
import {
    createQueue,
    getAllQueues,
    getMyQueues,
    getQueueById,
    updateQueueStatus,
    callNextQueue,
    getQueueStats,
    deleteQueue,
    cancelMyQueue,
    getQueuePosition,
} from "../services/queueService.js";
import {
    callNextSchema,
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

        const { branch, department } = req.body;

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

// GET ALL QUEUES
export const getAllQueuesController = async (
    _req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const queues = await getAllQueues();

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

// GET QUEUE POSITION (owner or admin)
export const getQueuePositionController = async (
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

        const id = (req.params.id as string).trim();
        const result = await getQueuePosition(id, req.user.id, req.user.role);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        const status =
            error.message === "Queue not found"
                ? 404
                : error.message === "You can only view your own ticket position"
                ? 403
                : 400;
        res.status(status).json({
            success: false,
            message: error.message || "Failed to fetch queue position",
        });
    }
};

// CALL NEXT QUEUE
export const callNextController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const validation = callNextSchema.safeParse(req.body || {});
        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.format(),
            });
            return;
        }

        const queue = await callNextQueue(validation.data);

        res.status(200).json({
            success: true,
            message: "Next queue called",
            data: queue,
        });
    } catch (error: any) {
        if (error.message === "No waiting queues") {
            res.status(200).json({
                success: true,
                message: "No waiting queues",
                data: null,
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message || "Failed to call next queue",
        });
    }
};

// GET QUEUE STATS
export const getQueueStatsController = async (
    _req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const stats = await getQueueStats();

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch queue stats",
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

        const { status, counterNumber } = req.body;
        const queue = await updateQueueStatus(id, status, counterNumber);

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

// CANCEL MY QUEUE (owner only)
export const cancelMyQueueController = async (
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

        const id = (req.params.id as string).trim();
        const queue = await cancelMyQueue(id, req.user.id);

        res.status(200).json({
            success: true,
            message: "Your ticket has been cancelled",
            data: queue,
        });
    } catch (error: any) {
        const status =
            error.message === "Queue not found"
                ? 404
                : error.message === "You can only cancel your own tickets"
                ? 403
                : 400;
        res.status(status).json({
            success: false,
            message: error.message || "Failed to cancel ticket",
        });
    }
};

// DELETE QUEUE
export const deleteQueueController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const id = (req.params.id as string).trim();

        const result = await deleteQueue(id);

        res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error: any) {
        const status = error.message === "Queue not found" ? 404 : 400;
        res.status(status).json({
            success: false,
            message: error.message || "Failed to delete queue",
        });
    }
};