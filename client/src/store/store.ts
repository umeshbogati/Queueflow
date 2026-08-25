import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import branchReducer from "./slices/branchSlice";
import departmentReducer from "./slices/departmentSlice";
import queueReducer from "./slices/queueSlice";
import counterReducer from "./slices/counterSlice";
import notificationReducer from "./slices/notificationSlice";
import agentReducer from "./slices/agentSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    branch: branchReducer,
    department: departmentReducer,
    queue: queueReducer,
    counter: counterReducer,
    notification: notificationReducer,
    agent: agentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;