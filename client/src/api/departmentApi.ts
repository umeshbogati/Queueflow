import api from "./axios";

export interface Department {
  _id: string;
  name: string;
  branchId: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDepartmentData {
  name: string;
  branchId: string;
}

export interface UpdateDepartmentData {
  name?: string;
  branchId?: string;
  isActive?: boolean;
}

export const getDepartments = async () => {
  const response = await api.get("/departments");

  return response.data;
};

export const getDepartmentById = async (id: string) => {
  const response = await api.get(`/departments/${id}`);

  return response.data;
};

export const createDepartment = async (
  data: CreateDepartmentData
) => {
  const response = await api.post("/departments", data);

  return response.data;
};

export const updateDepartment = async (
  id: string,
  data: UpdateDepartmentData
) => {
  const response = await api.put(
    `/departments/${id}`,
    data
  );

  return response.data;
};

export const deleteDepartment = async (id: string) => {
  const response = await api.delete(`/departments/${id}`);

  return response.data;
};