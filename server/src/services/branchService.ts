import Branch from "../models/Branch.js";
import type {
    CreateBranchInput,
    UpdateBranchInput,
} from "../validators/branchValidator.js";

// 1. Create a new branch
export const createBranch = async (data: CreateBranchInput) => {
    const { name, location } = data;

    const existingBranch = await Branch.findOne({ name });
    if (existingBranch) {
        throw new Error("A branch with this name already exists");
    }

    const branch = await Branch.create({
        name,
        location,
        isActive: true,
    });

    return branch;
};

// 2. Get all branches (optional filter for active-only)
export const getAllBranches = async (includeInactive: boolean = false) => {
    const filter = includeInactive ? {} : { isActive: true };
    const branches = await Branch.find(filter).sort({ createdAt: -1 });
    return branches;
};

// 3. Get single branch by ID
export const getBranchById = async (id: string) => {
    const branch = await Branch.findById(id);
    if (!branch) {
        throw new Error("Branch not found");
    }
    return branch;
};

// 4. Update an existing branch
export const updateBranch = async (id: string, data: UpdateBranchInput) => {
    const branch = await Branch.findById(id);
    if (!branch) {
        throw new Error("Branch not found");
    }

    // Check for unique name if name is being changed
    if (data.name && data.name !== branch.name) {
        const existingBranch = await Branch.findOne({ name: data.name });
        if (existingBranch) {
            throw new Error("A branch with this name already exists");
        }
    }

    Object.assign(branch, data);
    await branch.save();

    return branch;
};

// 5. Soft delete a branch (deactivate)
export const deleteBranch = async (id: string) => {
    const branch = await Branch.findById(id);
    if (!branch) {
        throw new Error("Branch not found");
    }

    branch.isActive = false;
    await branch.save();

    return { message: "Branch deactivated successfully" };
};
