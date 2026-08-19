import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  loginUser as loginApi,
  registerUser as registerApi,
} from "../../api/authApi";

import {
  getToken,
  getUser,
  logout as clearStoredAuth,
  setAuth,
} from "../../utils/auth";

import type { AuthUser } from "../../utils/auth";

import { getMessage } from "../utils";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token?: string;
  accessToken?: string;

  user?: AuthUser;

  message?: string;

  data?: {
    token?: string;
    accessToken?: string;
    user?: AuthUser;
    message?: string;
  };
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;

  isAuthenticated: boolean;

  loading: boolean;
  error: string | null;

  registerLoading: boolean;
  registerError: string | null;
  registerSuccess: string | null;
}

const savedToken = getToken();
const savedUser = getUser();

const initialState: AuthState = {
  user: savedUser,
  token: savedToken,

  isAuthenticated: Boolean(savedToken),

  loading: false,
  error: null,

  registerLoading: false,
  registerError: null,
  registerSuccess: null,
};

// Register Thunk
export const registerUser = createAsyncThunk<
  AuthResponse,
  RegisterPayload,
  {
    rejectValue: string;
  }
>(
  "auth/registerUser",

  async (payload, { rejectWithValue }) => {
    try {
      return (await registerApi(
        payload
      )) as AuthResponse;
    } catch (error: unknown) {
      return rejectWithValue(
        getMessage(
          error,
          "Registration failed. Please try again."
        )
      );
    }
  }
);

// Login thunk

export const loginUser = createAsyncThunk<
  {
    token: string;
    user: AuthUser | null;
  },
  LoginPayload,
  {
    rejectValue: string;
  }
>(
  "auth/loginUser",

  async (payload, { rejectWithValue }) => {
    try {
      const response =
        (await loginApi(payload)) as AuthResponse;

      const token =
        response.token ??
        response.accessToken ??
        response.data?.token ??
        response.data?.accessToken;

      const user =
        response.user ??
        response.data?.user ??
        null;

      if (!token) {
        return rejectWithValue(
          "Login successful but no authentication token was returned."
        );
      }

      setAuth(
        token,
        user ?? undefined
      );

      return {
        token,
        user,
      };
    } catch (error: unknown) {
      return rejectWithValue(
        getMessage(
          error,
          "Login failed. Please check your credentials."
        )
      );
    }
  }
);

// Logout Thunk
export const logoutUser =
  createAsyncThunk(
    "auth/logoutUser",

    async () => {
      clearStoredAuth();
    }
  );

  // Auth reducer
  const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },

    clearRegisterMessages: (state) => {
      state.registerError = null;
      state.registerSuccess = null;
    },

    restoreAuth: (state) => {
      const token = getToken();
      const user = getUser();

      state.token = token;
      state.user = user;
      state.isAuthenticated = Boolean(token);
    },
  },

  extraReducers: (builder) => {
    builder

      // LOGIN
      .addCase(
        loginUser.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        loginUser.fulfilled,
        (state, action) => {
          state.loading = false;

          state.error = null;

          state.token =
            action.payload.token;

          state.user =
            action.payload.user;

          state.isAuthenticated = true;
        }
      )

      .addCase(
        loginUser.rejected,
        (state, action) => {
          state.loading = false;

          state.isAuthenticated = false;

          state.error =
            action.payload ??
            "Login failed.";
        }
      )

      // REGISTER
      .addCase(
        registerUser.pending,
        (state) => {
          state.registerLoading = true;
          state.registerError = null;
          state.registerSuccess = null;
        }
      )

      .addCase(
        registerUser.fulfilled,
        (state, action) => {
          state.registerLoading = false;

          state.registerError = null;

          state.registerSuccess =
            action.payload.message ??
            action.payload.data?.message ??
            "Registration successful. You can now login.";
        }
      )

      .addCase(
        registerUser.rejected,
        (state, action) => {
          state.registerLoading = false;

          state.registerError =
            action.payload ??
            "Registration failed.";
        }
      )

      // LOGOUT
      .addCase(
        logoutUser.fulfilled,
        (state) => {
          state.user = null;
          state.token = null;

          state.isAuthenticated = false;

          state.loading = false;
          state.error = null;
        }
      );
  },
});

export const {
  clearAuthError,
  clearRegisterMessages,
  restoreAuth,
} = authSlice.actions;

export default authSlice.reducer;