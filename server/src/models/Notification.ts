import mongoose from "mongoose";
import type { Document, Types } from "mongoose";
const { Schema } = mongoose;

// Notification model for storing user notifications (e.g. "It's your turn!", "Your ticket is being served", etc.)
export type NotificationType =
    | "queue_called"     // staff called the customer's ticket -> "It's your turn!"
    | "queue_serving"    // customer is now being served
    | "queue_completed"  // service finished
    | "queue_cancelled"; // ticket was cancelled

export interface INotification extends Document {
    user: Types.ObjectId;        // recipient (the customer who owns the ticket)
    type: NotificationType;
    title: string;               
    message: string;             // detail, e.g. "Ticket REC005 - please go to Counter 3"
    queue?: Types.ObjectId;      // optional link back to the Queue document
    isRead: boolean;             // false = shows in unread badge
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true, // we always query "notifications of this user"
        },

        type: {
            type: String,
            enum: [
                "queue_called",
                "queue_serving",
                "queue_completed",
                "queue_cancelled",
            ],
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        message: {
            type: String,
            required: true,
            trim: true,
        },

        queue: {
            type: Schema.Types.ObjectId,
            ref: "Queue",
        },

        isRead: {
            type: Boolean,
            default: false,
            index: true, // fast unread-count queries
        },
    },
    {
        timestamps: true,
    }
);

const Notification = mongoose.model<INotification>(
    "Notification",
    notificationSchema
);

export default Notification;
