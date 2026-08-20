import api from "./axios";

export interface Department {
  _id: string;
  name: string;
  branchId?: string;
  branch: {
    _id: string;
    name: string;
  };
  description?: string;
  prefix?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDepartmentData {
  name: string;
  branch: string;
  prefix?: string;
  description?: string;
}

export interface UpdateDepartmentData {
  name?: string;
  branch?: string;
  prefix?: string;
  description?: string;
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
  const response = await api.patch(
    `/departments/${id}`,
    data
  );

  return response.data;
};

export const deleteDepartment = async (id: string) => {
  const response = await api.delete(`/departments/${id}`);

  return response.data;
};