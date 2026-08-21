import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const COUNTER_KEY = "counterNumber";

const loadCounterNumber = (): number => {
  const saved = localStorage.getItem(COUNTER_KEY);
  const parsed = saved ? Number(saved) : NaN;
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
};

interface CounterState {
  currentCounterNumber: number;
}

const initialState: CounterState = {
  currentCounterNumber: loadCounterNumber(),
};

const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    setCounterNumber: (state, action: PayloadAction<number>) => {
      const value = Number.isInteger(action.payload) && action.payload > 0 ? action.payload : 1;
      state.currentCounterNumber = value;
      localStorage.setItem(COUNTER_KEY, String(value));
    },
  },
});

export const { setCounterNumber } = counterSlice.actions;

export default counterSlice.reducer;
