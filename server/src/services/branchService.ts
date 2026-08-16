import mongoose from "mongoose";
import Branch from "../models/Branch.js";

export const createBranch = async (
    name: string,
    location: string
) => {
    const existingBranch = await Branch.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });
    if (existingBranch) {
        throw new Error("Branch with this name already exists");
    }
    const branch = await Branch.create({
        name: name.trim(),
        location: location.trim(),
        isActive: true,
    });
    return branch;
};

export const getAllBranches = async () => {
    return await Branch.find().sort({
        createdAt: -1,
    });
};

export const getBranchById = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid branch ID");
    }

    const branch = await Branch.findById(id);
    if (!branch) {
        throw new Error("Branch not found");
    }
    return branch;
};

export const updateBranch = async (
    id: string,
    name?: string,
    location?: string,
    isActive?: boolean
) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid branch ID");
    }

    const branch = await Branch.findById(id);
    if (!branch) {
        throw new Error("Branch not found");
    }

    if (name !== undefined) {
        const trimmedName = name.trim();
        const duplicate = await Branch.findOne({
            _id: { $ne: id },
            name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
        });
        if (duplicate) {
            throw new Error("Branch with this name already exists");
        }
        branch.name = trimmedName;
    }
    if (location !== undefined) {
        branch.location = location.trim();
    }
    if (isActive !== undefined) {
        branch.isActive = isActive;
    }

    await branch.save();
    return branch;
};

export const deleteBranch = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid branch ID");
    }

    const branch = await Branch.findById(id);
    if (!branch) {
        throw new Error("Branch not found");
    }

    await Branch.findByIdAndDelete(id);
    return { message: "Branch deleted successfully" };
};
