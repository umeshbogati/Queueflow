import mongoose, { Document, Schema } from "mongoose";

export interface IDepartment extends Document {
    name: string;
    branch: mongoose.Types.ObjectId;
    description?: string | undefined;
    isActive: boolean;
}

const departmentSchema = new Schema<IDepartment>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        branch: {
            type: Schema.Types.ObjectId,
            ref: "Branch",
            required: true,
        },
        description: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

departmentSchema.index({ name: 1, branch: 1 }, { unique: true });

const Department = mongoose.model<IDepartment>("Department", departmentSchema);

export default Department;
