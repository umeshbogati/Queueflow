import api from "./axios";

export interface CreateQueueData {
  branchId: string;
  departmentId: string;
}

export const getQueues = async () => {
  const response = await api.get("/queues");

  return response.data;
};

export const getQueueById = async (id: string) => {
  const response = await api.get(`/queues/${id}`);

  return response.data;
};

export const createQueue = async (data: CreateQueueData) => {
  const response = await api.post("/queues", data);

  return response.data;
};

export const updateQueue = async (
  id: string,
  data: Record<string, unknown>
) => {
  const response = await api.put(`/queues/${id}`, data);

  return response.data;
};

export const deleteQueue = async (id: string) => {
  const response = await api.delete(`/queues/${id}`);

  return response.data;
};