import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
} from "../../api/departmentApi";
import type {
  CreateDepartmentData,
  Department,
  UpdateDepartmentData,
} from "../../api/departmentApi";

import { unwrap, getMessage } from "../utils";

interface DepartmentState {
  departments: Department[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: DepartmentState = {
  departments: [],
  loading: false,
  saving: false,
  error: null,
};

export const fetchDepartments = createAsyncThunk<
  Department[],
  void,
  { rejectValue: string }
>("department/fetchDepartments", async (_, { rejectWithValue }) => {
  try {
    const response = await getDepartments();
    const data = unwrap<Department[] | undefined>(response);
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    return rejectWithValue(getMessage(error, "Failed to load departments."));
  }
});

export const addDepartment = createAsyncThunk<
  Department,
  CreateDepartmentData,
  { rejectValue: string }
>("department/addDepartment", async (data, { rejectWithValue }) => {
  try {
    const response = await createDepartment(data);
    return unwrap<Department>(response);
  } catch (error: unknown) {
    return rejectWithValue(
      getMessage(error, "Failed to create department.")
    );
  }
});

export const editDepartment = createAsyncThunk<
  Department,
  { id: string; data: UpdateDepartmentData },
  { rejectValue: string }
>("department/editDepartment", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await updateDepartment(id, data);
    return unwrap<Department>(response);
  } catch (error: unknown) {
    return rejectWithValue(
      getMessage(error, "Failed to update department.")
    );
  }
});

export const removeDepartment = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("department/removeDepartment", async (id, { rejectWithValue }) => {
  try {
    await deleteDepartment(id);
    return id;
  } catch (error: unknown) {
    return rejectWithValue(
      getMessage(error, "Failed to delete department.")
    );
  }
});

const departmentSlice = createSlice({
  name: "department",
  initialState,
  reducers: {
    clearDepartmentError: (state) => {
      state.error = null;
    },
    applyDepartmentCreated: (state, action) => {
      const dept = action.payload as Department;
      const exists = state.departments.find((d) => d._id === dept._id);
      if (!exists) {
        state.departments.unshift(dept);
      }
    },
    applyDepartmentUpdated: (state, action) => {
      const dept = action.payload as Department;
      const index = state.departments.findIndex((d) => d._id === dept._id);
      if (index !== -1) {
        state.departments[index] = dept;
      }
    },
    applyDepartmentDeleted: (state, action) => {
      const id = action.payload as string;
      state.departments = state.departments.filter((d) => d._id !== id);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load departments.";
      })
      .addCase(addDepartment.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(addDepartment.fulfilled, (state, action) => {
        state.saving = false;
        state.departments.push(action.payload);
      })
      .addCase(addDepartment.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? "Failed to create department.";
      })
      .addCase(editDepartment.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(editDepartment.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.departments.findIndex(
          (department) => department._id === action.payload._id
        );
        if (index !== -1) state.departments[index] = action.payload;
      })
      .addCase(editDepartment.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? "Failed to update department.";
      })
      .addCase(removeDepartment.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(removeDepartment.fulfilled, (state, action) => {
        state.saving = false;
        state.departments = state.departments.filter(
          (department) => department._id !== action.payload
        );
      })
      .addCase(removeDepartment.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? "Failed to delete department.";
      });
  },
});

export const {
  clearDepartmentError,
  applyDepartmentCreated,
  applyDepartmentUpdated,
  applyDepartmentDeleted,
} = departmentSlice.actions;

export default departmentSlice.reducer;
