import Branch from "../models/Branch.js";

export const createBranch = async (
    name: string,
    location: string
) => {
    const existingBranch = await Branch.findOne({
        name,
    });

    if (existingBranch) {
        throw new Error("Branch already exists");
    }

    const branch = await Branch.create({
        name,
        location,
    });

    return branch;
};

export const getAllBranches = async () => {
    return await Branch.find().sort({
        createdAt: -1,
    });
};

export const getBranchById = async (id: string) => {
    return await Branch.findById(id);
};

export const updateBranch = async (
    id: string,
    name?: string,
    location?: string,
    isActive?: boolean
) => {
    const branch = await Branch.findById(id);

    if (!branch) {
        throw new Error("Branch not found");
    }

    if (name !== undefined) {
        branch.name = name;
    }

    if (location !== undefined) {
        branch.location = location;
    }

    if (isActive !== undefined) {
        branch.isActive = isActive;
    }

    await branch.save();

    return branch;
};

export const deleteBranch = async (id: string) => {
    const branch = await Branch.findById(id);

    if (!branch) {
        throw new Error("Branch not found");
    }

    await Branch.findByIdAndDelete(id);

    return branch;
};