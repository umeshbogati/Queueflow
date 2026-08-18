import mongoose from "mongoose";
import Department from "../models/Department.js";
import Branch from "../models/Branch.js";

export const createDepartment = async (
    name: string,
    branch: string,
    prefix?: string | undefined,
    description?: string | undefined,
    isActive?: boolean | undefined
) => {
    if (!mongoose.Types.ObjectId.isValid(branch)) {
        throw new Error("Invalid branch ID");
    }
    const branchExists = await Branch.findById(branch);

    if (!branchExists) {
        throw new Error("Branch not found");
    }

    const existingDepartment = await Department.findOne({
        name,
        branch,
    });

    if (existingDepartment) {
        throw new Error(
            "Department already exists in this branch"
        );
    }

    const departmentData: {
        name: string;
        branch: mongoose.Types.ObjectId | string;
        prefix?: string;
        description?: string;
        isActive?: boolean;
    } = {
        name,
        branch,
    };

    if (prefix !== undefined) {
        departmentData.prefix = prefix;
    }
    if (description !== undefined) {
        departmentData.description = description;
    }
    if (isActive !== undefined) {
        departmentData.isActive = isActive;
    }

    const department = await Department.create(departmentData);

    return department;
};

export const getDepartments = async (branchId?: string) => {
    const filter: Record<string, unknown> = {};
    if (branchId) {
        filter.branch = branchId;
    }
    return await Department.find(filter)
        .populate("branch")
        .sort({ createdAt: -1 });
};

export const getDepartmentById = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid department ID");
    }

    const department = await Department.findById(id)
        .populate("branch");

    if (!department) {
        throw new Error("Department not found");
    }

    return department;
};

export const updateDepartment = async (
    id: string,
    data: {
        name?: string | undefined;
        prefix?: string | undefined;
        branch?: string | undefined;
        description?: string | undefined;
        isActive?: boolean | undefined;
    }
) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid department ID");
    }

    const department = await Department.findById(id);

    if (!department) {
        throw new Error("Department not found");
    }

    if (data.branch) {
        const branchExists = await Branch.findById(data.branch);

        if (!branchExists) {
            throw new Error("Branch not found");
        }
    }

    if (data.name || data.branch) {
        const duplicateDepartment = await Department.findOne({
            _id: { $ne: id },
            name: data.name ?? department.name,
            branch: data.branch ?? department.branch,
        });

        if (duplicateDepartment) {
            throw new Error(
                "Department already exists in this branch"
            );
        }
    }

    if (data.name !== undefined) department.name = data.name;
    if (data.prefix !== undefined) department.prefix = data.prefix;
    if (data.branch !== undefined) department.branch = new mongoose.Types.ObjectId(data.branch);
    if (data.description !== undefined) department.description = data.description;
    if (data.isActive !== undefined) department.isActive = data.isActive;

    return await department.save();
};

export const deleteDepartment = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid department ID");
    }

    const department = await Department.findById(id);

    if (!department) {
        throw new Error("Department not found");
    }

    await department.deleteOne();

    return {
        message: "Department deleted successfully",
    };
};