import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createQueue,
  getQueueStats,
  getQueues,
  getMyQueues,
  cancelMyQueue,
  updateQueueStatus,
  callNextQueue,
} from "../../api/queueApi";
import type {
  CallNextData,
  CreateQueueData,
  Queue,
  QueueStats,
  QueueStatus,
} from "../../api/queueApi";

import { unwrap, getMessage } from "../utils";

export interface AutoCallNextState {
  agentId: string;
  departmentId: string;
  waitingCount: number;
  delayMs: number;
  startedAt: string;
}

export interface NoShowState {
  queueId: string;
  displayNumber: string;
  message: string;
}

interface QueueState {
  queues: Queue[];
  selectedQueue: Queue | null;
  currentQueue: Queue | null;
  stats: QueueStats | null;
  autoCallNext: AutoCallNextState | null;
  noShow: NoShowState | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: QueueState = {
  queues: [],
  selectedQueue: null,
  currentQueue: null,
  stats: null,
  autoCallNext: null,
  noShow: null,
  loading: false,
  saving: false,
  error: null,
};

export const fetchQueues = createAsyncThunk<
  Queue[],
  void,
  { rejectValue: string }
>("queue/fetchQueues", async (_, { rejectWithValue }) => {
  try {
    const response = await getQueues();
    const data = unwrap<Queue[] | undefined>(response);
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    return rejectWithValue(getMessage(error, "Failed to load queues."));
  }
});

export const addQueue = createAsyncThunk<
  Queue,
  CreateQueueData,
  { rejectValue: string }
>("queue/addQueue", async (data, { rejectWithValue }) => {
  try {
    const response = await createQueue(data);
    return unwrap<Queue>(response);
  } catch (error: unknown) {
    return rejectWithValue(getMessage(error, "Failed to create queue."));
  }
});

export const callNext = createAsyncThunk<
  Queue | null,
  CallNextData | undefined,
  { rejectValue: string }
>("queue/callNext", async (data, { rejectWithValue }) => {
  try {
    const response = await callNextQueue(data);
    return unwrap<Queue | null>(response);
  } catch (error: unknown) {
    return rejectWithValue(
      getMessage(error, "Failed to call the next queue.")
    );
  }
});

export const changeQueueStatus = createAsyncThunk<
  Queue,
  { id: string; status: QueueStatus; counterNumber?: number },
  { rejectValue: string }
>("queue/changeQueueStatus", async (payload, { rejectWithValue }) => {
  try {
    const response = await updateQueueStatus(payload.id, {
      status: payload.status,
      ...(payload.counterNumber !== undefined
        ? { counterNumber: payload.counterNumber }
        : {}),
    });
    return unwrap<Queue>(response);
  } catch (error: unknown) {
    return rejectWithValue(
      getMessage(error, "Failed to update queue status.")
    );
  }
});

export const fetchMyQueues = createAsyncThunk<
  Queue[],
  void,
  { rejectValue: string }
>("queue/fetchMyQueues", async (_, { rejectWithValue }) => {
  try {
    const response = await getMyQueues();
    const data = unwrap<Queue[] | undefined>(response);
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    return rejectWithValue(getMessage(error, "Failed to load your tickets."));
  }
});

export const cancelMyTicket = createAsyncThunk<
  Queue,
  string,
  { rejectValue: string }
>("queue/cancelMyTicket", async (id, { rejectWithValue }) => {
  try {
    const response = await cancelMyQueue(id);
    return unwrap<Queue>(response);
  } catch (error: unknown) {
    return rejectWithValue(getMessage(error, "Failed to cancel your ticket."));
  }
});

export const fetchQueueStatistics = createAsyncThunk<
  QueueStats,
  void,
  { rejectValue: string }
>("queue/fetchQueueStatistics", async (_, { rejectWithValue }) => {
  try {
    const response = await getQueueStats();
    return unwrap<QueueStats>(response);
  } catch (error: unknown) {
    return rejectWithValue(
      getMessage(error, "Failed to load queue statistics.")
    );
  }
});

const queueSlice = createSlice({
  name: "queue",
  initialState,
  reducers: {
    clearQueueError: (state) => {
      state.error = null;
    },
    applyQueueUpdate: (state, action) => {
      const updatedQueue = action.payload as Queue;
      const index = state.queues.findIndex((q) => q._id === updatedQueue._id);
      if (index !== -1) {
        state.queues[index] = updatedQueue;
      } else {
        state.queues.unshift(updatedQueue);
      }
      if (state.selectedQueue?._id === updatedQueue._id) {
        state.selectedQueue = updatedQueue;
      }
      if (state.currentQueue?._id === updatedQueue._id) {
        if (
          updatedQueue.status === "completed" ||
          updatedQueue.status === "cancelled"
        ) {
          state.currentQueue = null;
        } else {
          state.currentQueue = updatedQueue;
        }
      } else if (
        !state.currentQueue &&
        (updatedQueue.status === "called" ||
          updatedQueue.status === "serving")
      ) {
        state.currentQueue = updatedQueue;
      }
    },
    // Live position push for my waiting ticket ("you are #N in line")
    applyQueuePosition: (
      state,
      action: { payload: { queueId: string; position: number } }
    ) => {
      const { queueId, position } = action.payload;
      const patch = (q: Queue) => {
        q.position = position;
      };

      const index = state.queues.findIndex((q) => q._id === queueId);
      if (index !== -1) patch(state.queues[index]);
      if (state.selectedQueue?._id === queueId) {
        state.selectedQueue = { ...state.selectedQueue, position };
      }
      if (state.currentQueue?._id === queueId) {
        state.currentQueue = { ...state.currentQueue, position };
      }
    },
    applyStatsUpdate: (state, action) => {
      state.stats = action.payload as QueueStats;
    },
    applyAutoCallNext: (state, action) => {
      state.autoCallNext = action.payload as AutoCallNextState;
    },
    clearAutoCallNext: (state) => {
      state.autoCallNext = null;
    },
    applyNoShow: (state, action) => {
      state.noShow = action.payload as NoShowState;
    },
    clearNoShow: (state) => {
      state.noShow = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQueues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQueues.fulfilled, (state, action) => {
        state.loading = false;
        state.queues = action.payload;
      })
      .addCase(fetchQueues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load queues.";
      })
      .addCase(addQueue.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(addQueue.fulfilled, (state, action) => {
        state.saving = false;
        state.queues.unshift(action.payload);
      })
      .addCase(addQueue.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? "Failed to create queue.";
      })
      .addCase(callNext.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(callNext.fulfilled, (state, action) => {
        state.saving = false;
        state.currentQueue = action.payload;

        if (action.payload) {
          const index = state.queues.findIndex(
            (queue) => queue._id === action.payload?._id
          );
          if (index !== -1) state.queues[index] = action.payload;
        }
      })
      .addCase(callNext.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? "Failed to call next queue.";
      })
      .addCase(changeQueueStatus.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(changeQueueStatus.fulfilled, (state, action) => {
        state.saving = false;
        state.selectedQueue = action.payload;
        state.currentQueue = action.payload;

        const index = state.queues.findIndex(
          (queue) => queue._id === action.payload._id
        );
        if (index !== -1) state.queues[index] = action.payload;
      })
      .addCase(changeQueueStatus.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? "Failed to update queue status.";
      })
      .addCase(fetchMyQueues.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedQueue = null;
      })
      .addCase(fetchMyQueues.fulfilled, (state, action) => {
        state.loading = false;
        // Auto-select the newest active ticket (list is sorted newest first)
        const active = action.payload.find(
          (queue) => queue.status === "waiting" || queue.status === "called"
        );
        if (active) {
          state.selectedQueue = active;
          const index = state.queues.findIndex((q) => q._id === active._id);
          if (index !== -1) state.queues[index] = active;
        }
      })
      .addCase(fetchMyQueues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load your tickets.";
      })
      .addCase(cancelMyTicket.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(cancelMyTicket.fulfilled, (state, action) => {
        state.saving = false;
        state.selectedQueue = action.payload;

        const index = state.queues.findIndex(
          (queue) => queue._id === action.payload._id
        );
        if (index !== -1) state.queues[index] = action.payload;
      })
      .addCase(cancelMyTicket.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? "Failed to cancel your ticket.";
      })
      .addCase(fetchQueueStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load queue statistics.";
      });
  },
});

export const {
  clearQueueError,
  applyQueueUpdate,
  applyQueuePosition,
  applyStatsUpdate,
  applyAutoCallNext,
  clearAutoCallNext,
  applyNoShow,
  clearNoShow,
} = queueSlice.actions;

export default queueSlice.reducer;
