import api from "./axios";

export type QueueStatus =
  | "waiting"
  | "called"
  | "serving"
  | "completed"
  | "cancelled";

export interface QueueParty {
  _id: string;
  name: string;
}

export interface Queue {
  _id: string;
  displayNumber: string;
  status: QueueStatus;
  counterNumber?: number;
  position?: number;
  branch?: QueueParty;
  department?: QueueParty;
  createdAt?: string;
  updatedAt?: string;
}

export interface QueueStats {
  total: number;
  waiting: number;
  called: number;
  serving: number;
  completed: number;
  cancelled: number;
}

export interface CreateQueueData {
  branch: string;
  department: string;
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

export interface CallNextData {
  counterNumber?: number;
  departmentId?: string;
}

export const callNextQueue = async (data: CallNextData = {}) => {
  const response = await api.patch("/queues/call-next", data);
  return response.data;
};

export const updateQueueStatus = async (
  id: string,
  data: { status: QueueStatus; counterNumber?: number }
) => {
  const response = await api.patch(`/queues/${id}/status`, data);
  return response.data;
};

export const getQueueStats = async () => {
  const response = await api.get("/queues/stats");
  return response.data;
};
