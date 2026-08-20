import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  createBranch,
  deleteBranch,
  getBranchById,
  getBranches,
  updateBranch,
} from "../../api/branchApi";

import type {
  Branch,
  CreateBranchData,
  UpdateBranchData,
} from "../../api/branchApi";

import { unwrap, getMessage } from "../utils";

interface BranchState {
  branches: Branch[];
  selectedBranch: Branch | null;

  loading: boolean;
  saving: boolean;

  error: string | null;
}

const initialState: BranchState = {
  branches: [],
  selectedBranch: null,

  loading: false,
  saving: false,

  error: null,
};

export const fetchBranches =
  createAsyncThunk<
    Branch[],
    void,
    { rejectValue: string }
  >(
    "branch/fetchBranches",

    async (_, { rejectWithValue }) => {
      try {
        const response =
          await getBranches();

        const data =
          unwrap<
            Branch[] | undefined
          >(response);

        return Array.isArray(data)
          ? data
          : [];
      } catch (error: unknown) {
        return rejectWithValue(
          getMessage(
            error,
            "Failed to load branches."
          )
        );
      }
    }
  );

export const fetchBranchById =
  createAsyncThunk<
    Branch,
    string,
    { rejectValue: string }
  >(
    "branch/fetchBranchById",

    async (
      id,
      { rejectWithValue }
    ) => {
      try {
        const response =
          await getBranchById(id);

        return unwrap<Branch>(
          response
        );
      } catch (error: unknown) {
        return rejectWithValue(
          getMessage(
            error,
            "Failed to load branch."
          )
        );
      }
    }
  );

export const addBranch =
  createAsyncThunk<
    Branch,
    CreateBranchData,
    { rejectValue: string }
  >(
    "branch/addBranch",

    async (
      data,
      { rejectWithValue }
    ) => {
      try {
        const response =
          await createBranch(data);

        return unwrap<Branch>(
          response
        );
      } catch (error: unknown) {
        return rejectWithValue(
          getMessage(
            error,
            "Failed to create branch."
          )
        );
      }
    }
  );

export const editBranch =
  createAsyncThunk<
    Branch,
    {
      id: string;
      data: UpdateBranchData;
    },
    { rejectValue: string }
  >(
    "branch/editBranch",

    async (
      { id, data },
      { rejectWithValue }
    ) => {
      try {
        const response =
          await updateBranch(
            id,
            data
          );

        return unwrap<Branch>(
          response
        );
      } catch (error: unknown) {
        return rejectWithValue(
          getMessage(
            error,
            "Failed to update branch."
          )
        );
      }
    }
  );

export const removeBranch =
  createAsyncThunk<
    string,
    string,
    { rejectValue: string }
  >(
    "branch/removeBranch",

    async (
      id,
      { rejectWithValue }
    ) => {
      try {
        await deleteBranch(id);

        return id;
      } catch (error: unknown) {
        return rejectWithValue(
          getMessage(
            error,
            "Failed to delete branch."
          )
        );
      }
    }
  );

const branchSlice = createSlice({
  name: "branch",

  initialState,

  reducers: {
    clearSelectedBranch: (
      state
    ) => {
      state.selectedBranch = null;
    },

    clearBranchError: (
      state
    ) => {
      state.error = null;
    },

    applyBranchCreated: (state, action) => {
      const branch = action.payload as Branch;
      const exists = state.branches.find((b) => b._id === branch._id);
      if (!exists) {
        state.branches.unshift(branch);
      }
    },
    applyBranchUpdated: (state, action) => {
      const branch = action.payload as Branch;
      const index = state.branches.findIndex((b) => b._id === branch._id);
      if (index !== -1) {
        state.branches[index] = branch;
      }
      if (state.selectedBranch?._id === branch._id) {
        state.selectedBranch = branch;
      }
    },
    applyBranchDeleted: (state, action) => {
      const id = action.payload as string;
      state.branches = state.branches.filter((b) => b._id !== id);
      if (state.selectedBranch?._id === id) {
        state.selectedBranch = null;
      }
    },
  },

  extraReducers: (
    builder
  ) => {
    builder

      .addCase(
        fetchBranches.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchBranches.fulfilled,
        (state, action) => {
          state.loading = false;
          state.branches =
            action.payload;
        }
      )

      .addCase(
        fetchBranches.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ??
            "Failed to load branches.";
        }
      )

      .addCase(
        fetchBranchById.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchBranchById.fulfilled,
        (state, action) => {
          state.loading = false;
          state.selectedBranch =
            action.payload;
        }
      )

      .addCase(
        fetchBranchById.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ??
            "Failed to load branch.";
        }
      )

      .addCase(
        addBranch.pending,
        (state) => {
          state.saving = true;
          state.error = null;
        }
      )

      .addCase(
        addBranch.fulfilled,
        (state, action) => {
          state.saving = false;
          state.branches.push(
            action.payload
          );
        }
      )

      .addCase(
        addBranch.rejected,
        (state, action) => {
          state.saving = false;
          state.error =
            action.payload ??
            "Failed to create branch.";
        }
      )

      .addCase(
        editBranch.pending,
        (state) => {
          state.saving = true;
          state.error = null;
        }
      )

      .addCase(
        editBranch.fulfilled,
        (state, action) => {
          state.saving = false;

          const index =
            state.branches.findIndex(
              (branch) =>
                branch._id ===
                action.payload._id
            );

          if (index !== -1) {
            state.branches[index] =
              action.payload;
          }

          if (
            state.selectedBranch?._id ===
            action.payload._id
          ) {
            state.selectedBranch =
              action.payload;
          }
        }
      )

      .addCase(
        editBranch.rejected,
        (state, action) => {
          state.saving = false;
          state.error =
            action.payload ??
            "Failed to update branch.";
        }
      )

      .addCase(
        removeBranch.pending,
        (state) => {
          state.saving = true;
          state.error = null;
        }
      )

      .addCase(
        removeBranch.fulfilled,
        (state, action) => {
          state.saving = false;

          state.branches =
            state.branches.filter(
              (branch) =>
                branch._id !==
                action.payload
            );

          if (
            state.selectedBranch?._id ===
            action.payload
          ) {
            state.selectedBranch =
              null;
          }
        }
      )

      .addCase(
        removeBranch.rejected,
        (state, action) => {
          state.saving = false;
          state.error =
            action.payload ??
            "Failed to delete branch.";
        }
      );
  },
});

export const {
  clearSelectedBranch,
  clearBranchError,
  applyBranchCreated,
  applyBranchUpdated,
  applyBranchDeleted,
} = branchSlice.actions;

export default branchSlice.reducer;
