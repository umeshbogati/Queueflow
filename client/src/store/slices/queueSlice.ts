import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createQueue,
  deleteQueue,
  getQueueById,
  getQueueStats,
  getQueues,
  updateQueueStatus,
  callNextQueue,
} from "../../api/queueApi";
import type {
  CreateQueueData,
  Queue,
  QueueStats,
  QueueStatus,
} from "../../api/queueApi";

import { unwrap, getMessage } from "../utils";

interface QueueState {
  queues: Queue[];
  selectedQueue: Queue | null;
  currentQueue: Queue | null;
  stats: QueueStats | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: QueueState = {
  queues: [],
  selectedQueue: null,
  currentQueue: null,
  stats: null,
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

export const fetchQueueById = createAsyncThunk<
  Queue,
  string,
  { rejectValue: string }
>("queue/fetchQueueById", async (id, { rejectWithValue }) => {
  try {
    const response = await getQueueById(id);
    return unwrap<Queue>(response);
  } catch (error: unknown) {
    return rejectWithValue(getMessage(error, "Failed to load queue."));
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
  number,
  { rejectValue: string }
>("queue/callNext", async (counterNumber, { rejectWithValue }) => {
  try {
    const response = await callNextQueue(counterNumber);
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

export const removeQueue = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("queue/removeQueue", async (id, { rejectWithValue }) => {
  try {
    await deleteQueue(id);
    return id;
  } catch (error: unknown) {
    return rejectWithValue(getMessage(error, "Failed to delete queue."));
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
    clearSelectedQueue: (state) => {
      state.selectedQueue = null;
    },
    clearCurrentQueue: (state) => {
      state.currentQueue = null;
    },
    clearQueueError: (state) => {
      state.error = null;
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
      .addCase(fetchQueueById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQueueById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedQueue = action.payload;
      })
      .addCase(fetchQueueById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load queue.";
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
      .addCase(removeQueue.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(removeQueue.fulfilled, (state, action) => {
        state.saving = false;
        state.queues = state.queues.filter(
          (queue) => queue._id !== action.payload
        );
        if (state.selectedQueue?._id === action.payload) {
          state.selectedQueue = null;
        }
        if (state.currentQueue?._id === action.payload) {
          state.currentQueue = null;
        }
      })
      .addCase(removeQueue.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? "Failed to delete queue.";
      })
      .addCase(fetchQueueStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQueueStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchQueueStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load queue statistics.";
      });
  },
});

export const {
  clearSelectedQueue,
  clearCurrentQueue,
  clearQueueError,
} = queueSlice.actions;

export default queueSlice.reducer;
