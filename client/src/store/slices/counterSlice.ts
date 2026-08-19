import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CounterState {
  currentCounterNumber: number;
}

const initialState: CounterState = {
  currentCounterNumber: 1,
};

const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    setCounterNumber: (state, action: PayloadAction<number>) => {
      state.currentCounterNumber = action.payload > 0 ? action.payload : 1;
    },
    incrementCounter: (state) => {
      state.currentCounterNumber += 1;
    },
    resetCounter: (state) => {
      state.currentCounterNumber = 1;
    },
  },
});

export const {
  setCounterNumber,
  incrementCounter,
  resetCounter,
} = counterSlice.actions;

export default counterSlice.reducer;
