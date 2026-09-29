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
  },
  selectors: {
    selectSimulateFailure: (state) => state.simulateFailure,
  },
});

export const { setSimulateFailure } = devSlice.actions;
export const { selectSimulateFailure } = devSlice.selectors;
