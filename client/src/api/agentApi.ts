import api from "./axios";

export interface AgentParty {
  _id: string;
  name: string;
  email?: string;
  location?: string;
  prefix?: string;
}

export interface Agent {
  _id: string;
  user: AgentParty;
  branch: AgentParty;
  department: AgentParty;
  counterNumber: number;
  officeStart: number;
  officeEnd: number;
  maxTokensPerDay: number;
  tokensServedToday: number;
  isActive: boolean;
  status: "available" | "busy" | "offline";
  createdAt?: string;
  updatedAt?: string;
}

export interface AgentStats {
  agent: Agent;
  totalServed: number;
  completedToday: number;
  currentlyServing: number;
  tokensRemaining: number;
  officeHoursActive: boolean;
}

export interface CreateAgentData {
  user: string;
  branch: string;
  department: string;
  counterNumber: number;
  officeStart?: number;
  officeEnd?: number;
  maxTokensPerDay?: number;
}

export interface UpdateAgentData {
  counterNumber?: number;
  officeStart?: number;
  officeEnd?: number;
  maxTokensPerDay?: number;
  isActive?: boolean;
  status?: "available" | "busy" | "offline";
}

export const getAgents = async () => {
  const response = await api.get("/agents");
  return response.data;
};

export const createAgent = async (data: CreateAgentData) => {
  const response = await api.post("/agents", data);
  return response.data;
};

export const updateAgent = async (id: string, data: UpdateAgentData) => {
  const response = await api.patch(`/agents/${id}`, data);
  return response.data;
};

export const deleteAgent = async (id: string) => {
  const response = await api.delete(`/agents/${id}`);
  return response.data;
};

export const getAgentStats = async () => {
  const response = await api.get("/agents/stats");
  return response.data;
};

export const agentCallNext = async (agentId: string) => {
  const response = await api.patch(`/agents/${agentId}/call-next`);
  return response.data;
};

export const agentCompleteTicket = async (agentId: string, queueId: string) => {
  const response = await api.patch(`/agents/${agentId}/complete`, { queueId });
  return response.data;
};
