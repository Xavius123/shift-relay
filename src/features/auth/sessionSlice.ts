import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type DemoRole = 'shiftManager' | 'manager';
export type DemoAccountId = 'jordan' | 'avery' | 'elena';

interface SessionState {
  accountId: DemoAccountId | null;
}

const initialState: SessionState = {
  accountId: null,
};

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    signIn(state, action: PayloadAction<DemoAccountId>) {
      state.accountId = action.payload;
    },
    signOut(state) {
      state.accountId = null;
    },
  },
  selectors: {
    selectDemoAccountId: (state) => state.accountId,
  },
});

export const { signIn, signOut } = sessionSlice.actions;
export const { selectDemoAccountId } = sessionSlice.selectors;
