import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getMyNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../api/notificationApi";
import type { Notification } from "../../api/notificationApi";
import { unwrap, getMessage } from "../utils";

interface NotificationState {
  items: Notification[];      // latest notifications (newest first)
  unreadCount: number;        // powers the red badge on the bell
  lastLive: Notification | null; // newest SOCKET-delivered notification (powers the toast)
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  lastLive: null,
  loading: false,
  error: null,
};
// async thunks for fetching notifications and unread count, marking as read, etc.
export const fetchNotifications = createAsyncThunk<
  Notification[],
  void,
  { rejectValue: string }
>("notification/fetchNotifications", async (_, { rejectWithValue }) => {
  try {
    const response = await getMyNotifications();
    const data = unwrap<Notification[] | undefined>(response);
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    return rejectWithValue(getMessage(error, "Failed to load notifications."));
  }
});

// Fetch badge number (used on app start)
export const fetchUnreadCount = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>("notification/fetchUnreadCount", async (_, { rejectWithValue }) => {
  try {
    const response = await getUnreadCount();
    const data = unwrap<{ count: number } | undefined>(response);
    return data?.count ?? 0;
  } catch (error: unknown) {
    return rejectWithValue(getMessage(error, "Failed to load unread count."));
  }
});

// Click one notification -> mark it read on the server + in state
export const markNotificationAsRead = createAsyncThunk<
  Notification,
  string,
  { rejectValue: string }
>("notification/markAsRead", async (id, { rejectWithValue }) => {
  try {
    const response = await markNotificationRead(id);
    return unwrap<Notification>(response);
  } catch (error: unknown) {
    return rejectWithValue(getMessage(error, "Failed to mark as read."));
  }
});

// "Mark all read" button
export const markAllAsRead = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("notification/markAllAsRead", async (_, { rejectWithValue }) => {
  try {
    await markAllNotificationsRead();
  } catch (error: unknown) {
    return rejectWithValue(getMessage(error, "Failed to mark all as read."));
  }
});

// ---- Slice ------------------------------------------------------------------

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
  // This is called when a new notification arrives via socket.io
    applyNewNotification(state, action: { payload: Notification }) {
      // avoid duplicates if the same event arrives twice
      if (!state.items.some((n) => n._id === action.payload._id)) {
        state.items.unshift(action.payload);
        // keep the list capped at 20 to match the REST endpoint
        if (state.items.length > 20) state.items.pop();
      }
      // update the "last live" notification for the toast, and bump the unread count if it's unread
      state.lastLive = action.payload;
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },

    // Reset everything on logout so the next user starts clean
    clearNotifications() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load notifications.";
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const item = state.items.find((n) => n._id === action.payload._id);
        if (item && !item.isRead) {
          item.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach((n) => {
          n.isRead = true;
        });
        state.unreadCount = 0;
      });
  },
});

export const { applyNewNotification, clearNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;
