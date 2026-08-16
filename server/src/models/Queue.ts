import mongoose, { Document, Schema } from "mongoose";

export type QueueStatus = "waiting" | "called" | "serving" | "completed" | "cancelled";

export interface IQueue extends Document {
    ticketNumber: number;
    displayNumber: string;
    branch: mongoose.Types.ObjectId;
    department: mongoose.Types.ObjectId;
    customer: mongoose.Types.ObjectId;
    status: QueueStatus;
    date: string;
    calledAt?: Date;
    servingAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const queueSchema = new Schema<IQueue>(
    {
        ticketNumber: {
            type: Number,
            required: true,
        },
        displayNumber: {
            type: String,
            required: true,
            trim: true,
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
        customer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ["waiting", "called", "serving", "completed", "cancelled"],
            default: "waiting",
            index: true,
        },
        date: {
            type: String,
            required: true,
            index: true,
        },
        calledAt: {
            type: Date,
        },
        servingAt: {
            type: Date,
        },
        completedAt: {
            type: Date,
        },
        cancelledAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

queueSchema.index({ department: 1, date: 1, ticketNumber: 1 }, { unique: true });

const Queue = mongoose.model<IQueue>("Queue", queueSchema);

export default Queue;
