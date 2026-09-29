import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface DevState {
  simulateFailure: boolean;
  latencyMs: number;
}

const initialState: DevState = {
  simulateFailure: false,
  latencyMs: 200,
};

export const devSlice = createSlice({
  name: 'dev',
  initialState,
  reducers: {
    setSimulateFailure(state, action: PayloadAction<boolean>) {
      state.simulateFailure = action.payload;
    },
    setLatencyMs(state, action: PayloadAction<number>) {
      state.latencyMs = action.payload;
    },
  },
  selectors: {
    selectSimulateFailure: (state) => state.simulateFailure,
    selectLatencyMs: (state) => state.latencyMs,
  },
});

export const { setLatencyMs, setSimulateFailure } = devSlice.actions;
export const { selectLatencyMs, selectSimulateFailure } = devSlice.selectors;
