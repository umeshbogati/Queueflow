import mongoose from "mongoose";
import type { Document, Types } from "mongoose";
const { Schema } = mongoose;

export type AgentStatus = "available" | "busy" | "offline";

export interface IAgent extends Document {
    user: Types.ObjectId;
    branch: Types.ObjectId;
    department: Types.ObjectId;
    counterNumber: number;
    officeStart: number;
    officeEnd: number;
    maxTokensPerDay: number;
    tokensServedToday: number;
    lastResetDate: string;
    isActive: boolean;
    status: AgentStatus;
    createdAt: Date;
    updatedAt: Date;
}

const agentSchema = new Schema<IAgent>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        branch: {
            type: Schema.Types.ObjectId,
            ref: "Branch",
            required: true,
            index: true,
        },

        department: {
            type: Schema.Types.ObjectId,
            ref: "Department",
            required: true,
            index: true,
        },

        counterNumber: {
            type: Number,
            required: true,
            min: 1,
            max: 999,
        },

        officeStart: {
            type: Number,
            required: true,
            min: 0,
            max: 23,
            default: 9,
        },

        officeEnd: {
            type: Number,
            required: true,
            min: 0,
            max: 23,
            default: 17,
        },

        maxTokensPerDay: {
            type: Number,
            required: true,
            min: 1,
            default: 20,
        },

        tokensServedToday: {
            type: Number,
            default: 0,
        },

        lastResetDate: {
            type: String,
            default: "",
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        status: {
            type: String,
            enum: ["available", "busy", "offline"],
            default: "available",
        },
    },
    {
        timestamps: true,
    }
);

// One agent record per user per department
agentSchema.index({ user: 1, department: 1 }, { unique: true });

const Agent = mongoose.model<IAgent>("Agent", agentSchema);

export default Agent;
