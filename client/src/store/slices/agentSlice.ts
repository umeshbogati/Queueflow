import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  getAgentStats,
  agentCallNext,
  agentCompleteTicket,
} from "../../api/agentApi";
import type {
  Agent,
  AgentStats,
  CreateAgentData,
  UpdateAgentData,
} from "../../api/agentApi";
import { unwrap, getMessage } from "../utils";

interface AgentState {
  agents: Agent[];
  stats: AgentStats[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: AgentState = {
  agents: [],
  stats: [],
  loading: false,
  saving: false,
  error: null,
};

export const fetchAgents = createAsyncThunk<
  Agent[],
  void,
  { rejectValue: string }
>("agent/fetchAgents", async (_, { rejectWithValue }) => {
  try {
    const response = await getAgents();
    const data = unwrap<Agent[] | undefined>(response);
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    return rejectWithValue(getMessage(error, "Failed to load agents."));
  }
});

export const addAgent = createAsyncThunk<
  Agent,
  CreateAgentData,
  { rejectValue: string }
>("agent/addAgent", async (data, { rejectWithValue }) => {
  try {
    const response = await createAgent(data);
    return unwrap<Agent>(response);
  } catch (error: unknown) {
    return rejectWithValue(getMessage(error, "Failed to create agent."));
  }
});

export const editAgent = createAsyncThunk<
  Agent,
  { id: string; data: UpdateAgentData },
  { rejectValue: string }
>("agent/editAgent", async (payload, { rejectWithValue }) => {
  try {
    const response = await updateAgent(payload.id, payload.data);
    return unwrap<Agent>(response);
  } catch (error: unknown) {
    return rejectWithValue(getMessage(error, "Failed to update agent."));
  }
});

export const removeAgent = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("agent/removeAgent", async (id, { rejectWithValue }) => {
  try {
    await deleteAgent(id);
    return id;
  } catch (error: unknown) {
    return rejectWithValue(getMessage(error, "Failed to delete agent."));
  }
});

export const fetchAgentStats = createAsyncThunk<
  AgentStats[],
  void,
  { rejectValue: string }
>("agent/fetchAgentStats", async (_, { rejectWithValue }) => {
  try {
    const response = await getAgentStats();
    const data = unwrap<AgentStats[] | undefined>(response);
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    return rejectWithValue(getMessage(error, "Failed to load agent stats."));
  }
});

export const callNextByAgent = createAsyncThunk<
  Agent | null,
  string,
  { rejectValue: string }
>("agent/callNext", async (agentId, { rejectWithValue }) => {
  try {
    const response = await agentCallNext(agentId);
    return unwrap<Agent | null>(response);
  } catch (error: unknown) {
    return rejectWithValue(
      getMessage(error, "Failed to call next queue.")
    );
  }
});

export const completeAgentTicket = createAsyncThunk<
  { agentId: string; queueId: string },
  { agentId: string; queueId: string },
  { rejectValue: string }
>("agent/completeTicket", async (payload, { rejectWithValue }) => {
  try {
    await agentCompleteTicket(payload.agentId, payload.queueId);
    return payload;
  } catch (error: unknown) {
    return rejectWithValue(
      getMessage(error, "Failed to complete ticket.")
    );
  }
});

const agentSlice = createSlice({
  name: "agent",
  initialState,
  reducers: {
    clearAgentError: (state) => {
      state.error = null;
    },
    applyAgentUpdate: (state, action) => {
      const updatedAgent = action.payload as Agent;
      const index = state.agents.findIndex((a) => a._id === updatedAgent._id);
      if (index !== -1) {
        state.agents[index] = updatedAgent;
      } else {
        state.agents.unshift(updatedAgent);
      }

      const statIndex = state.stats.findIndex(
        (s) => s.agent._id === updatedAgent._id
      );
      if (statIndex !== -1) {
        const existing = state.stats[statIndex];
        state.stats[statIndex] = {
          ...existing,
          agent: updatedAgent,
          tokensRemaining: Math.max(
            0,
            updatedAgent.maxTokensPerDay - updatedAgent.tokensServedToday
          ),
          currentlyServing:
            updatedAgent.status === "busy"
              ? existing.currentlyServing
              : 0,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.loading = false;
        state.agents = action.payload;
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load agents.";
      })
      .addCase(addAgent.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(addAgent.fulfilled, (state, action) => {
        state.saving = false;
        state.agents.unshift(action.payload);
      })
      .addCase(addAgent.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? "Failed to create agent.";
      })
      .addCase(editAgent.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(editAgent.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.agents.findIndex(
          (a) => a._id === action.payload._id
        );
        if (index !== -1) state.agents[index] = action.payload;
      })
      .addCase(editAgent.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? "Failed to update agent.";
      })
      .addCase(removeAgent.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(removeAgent.fulfilled, (state, action) => {
        state.saving = false;
        state.agents = state.agents.filter((a) => a._id !== action.payload);
      })
      .addCase(removeAgent.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? "Failed to delete agent.";
      })
      .addCase(fetchAgentStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgentStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAgentStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load agent stats.";
      })
      .addCase(callNextByAgent.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(callNextByAgent.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(callNextByAgent.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? "Failed to call next queue.";
      })
      .addCase(completeAgentTicket.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(completeAgentTicket.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(completeAgentTicket.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? "Failed to complete ticket.";
      });
  },
});

export const {
  clearAgentError,
  applyAgentUpdate,
} = agentSlice.actions;

export default agentSlice.reducer;
