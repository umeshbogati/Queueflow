import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.js";
import {
    createAgent,
    getAllAgents,
    getAgentById,
    getAgentByUserId,
    updateAgent,
    deleteAgent,
    getAgentsByDepartment,
    getAgentStats,
    agentCallNext,
    agentCompleteTicket,
    canServeMore,
} from "../services/agentService.js";

// CREATE AGENT
export const createAgentController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const agent = await createAgent(req.body);

        res.status(201).json({
            success: true,
            message: "Agent created successfully",
            data: agent,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to create agent",
        });
    }
};

// GET ALL AGENTS
export const getAllAgentsController = async (
    _req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const agents = await getAllAgents();

        res.status(200).json({
            success: true,
            data: agents,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch agents",
        });
    }
};

// GET AGENT BY ID
export const getAgentByIdController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const id = (req.params.id as string).trim();
        const agent = await getAgentById(id);

        res.status(200).json({
            success: true,
            data: agent,
        });
    } catch (error: any) {
        const status = error.message === "Agent not found" ? 404 : 400;
        res.status(status).json({
            success: false,
            message: error.message || "Failed to fetch agent",
        });
    }
};

// GET AGENT BY USER ID
export const getAgentByUserIdController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const id = (req.params.userId as string).trim();
        const agents = await getAgentByUserId(id);

        res.status(200).json({
            success: true,
            data: agents,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to fetch agent",
        });
    }
};

// GET AGENTS BY DEPARTMENT
export const getAgentsByDepartmentController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const id = (req.params.departmentId as string).trim();
        const agents = await getAgentsByDepartment(id);

        res.status(200).json({
            success: true,
            data: agents,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to fetch agents",
        });
    }
};

// UPDATE AGENT
export const updateAgentController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const id = (req.params.id as string).trim();

        const agent = await updateAgent(id, req.body);

        res.status(200).json({
            success: true,
            message: "Agent updated successfully",
            data: agent,
        });
    } catch (error: any) {
        const status = error.message === "Agent not found" ? 404 : 400;
        res.status(status).json({
            success: false,
            message: error.message || "Failed to update agent",
        });
    }
};

// DELETE AGENT
export const deleteAgentController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const id = (req.params.id as string).trim();
        const result = await deleteAgent(id);

        res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error: any) {
        const status = error.message === "Agent not found" ? 404 : 400;
        res.status(status).json({
            success: false,
            message: error.message || "Failed to delete agent",
        });
    }
};

// GET AGENT STATS
export const getAgentStatsController = async (
    _req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const stats = await getAgentStats();

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch agent stats",
        });
    }
};

// AGENT CALL NEXT
export const agentCallNextController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const id = (req.params.id as string).trim();
        const queue = await agentCallNext(id);

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
        res.status(400).json({
            success: false,
            message: error.message || "Failed to call next queue",
        });
    }
};

// AGENT COMPLETE TICKET
export const agentCompleteTicketController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const agentId = (req.params.id as string).trim();
        const { queueId } = req.body;

        if (!queueId) {
            res.status(400).json({
                success: false,
                message: "queueId is required",
            });
            return;
        }

        const queue = await agentCompleteTicket(agentId, queueId);

        res.status(200).json({
            success: true,
            message: "Ticket completed successfully",
            data: queue,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to complete ticket",
        });
    }
};

// CHECK CAN SERVE MORE
export const canServeMoreController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const id = (req.params.id as string).trim();
        const result = await canServeMore(id);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to check agent status",
        });
    }
};
