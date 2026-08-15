import mongoose, { Document, Schema } from "mongoose";

export interface IBranch extends Document {
    name: string;
    location: string;
    isActive: boolean;
}

const branchSchema = new Schema<IBranch>({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
},{
    timestamps: true,
});

const Branch = mongoose.model<IBranch>(
  "Branch",
  branchSchema
);

export default Branch;