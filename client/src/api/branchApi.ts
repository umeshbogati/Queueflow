import api from "./axios";

export interface Branch {
    _id: string;
    name: string;
    location?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateBranchData {
    name: string;
    location?: string;
}

export interface UpdateBranchData {
    name?: string;
    location?: string;
    isActive?: boolean;
}

export const getBranches = async () => {
    const response = await api.get("/branches");
    return response.data;
};

export const createBranch = async (data: CreateBranchData) => {
    const response = await api.post("/branches", data);
    return response.data;
};

export const updateBranch = async (
    id: string,
    data: UpdateBranchData
) => {
    const response = await api.put(`/branches/${id}`, data);
    return response.data;
};

export const deleteBranch = async (id: string) => {
    const response = await api.delete(`/branches/${id}`);
    return response.data;
};