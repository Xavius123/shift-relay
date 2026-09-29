import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/** A photo taken on the walk but not saved to the log yet. */
export interface WalkDraft {
  id: string;
  uri: string;
  at: string;
}

/**
 * Shift photos under review, per log. UI state: nothing reaches the API until the Shift
 * Manager saves, so drafts survive closing the sheet but not an app restart.
 */
export type WalkDraftsState = Record<string, WalkDraft[]>;

const initialState: WalkDraftsState = {};
let draftCount = 0;

export const walkDraftsSlice = createSlice({
  name: 'walkDrafts',
  initialState,
  reducers: {
    addWalkDrafts: {
      reducer(state, action: PayloadAction<{ logId: string; drafts: WalkDraft[] }>) {
        const { logId, drafts } = action.payload;
        state[logId] = [...(state[logId] ?? []), ...drafts];
      },
      // Ids are made here, not in the reducer, so the reducer stays pure.
      prepare(logId: string, uris: string[]) {
        return {
          payload: {
            logId,
            drafts: uris.map((uri) => {
              draftCount += 1;
              return { id: `draft-${draftCount}`, uri, at: new Date().toISOString() };
            }),
          },
        };
      },
    },
    discardWalkDraft(state, action: PayloadAction<{ logId: string; draftId: string }>) {
      const { logId, draftId } = action.payload;
      state[logId] = (state[logId] ?? []).filter((draft) => draft.id !== draftId);
    },
    clearWalkDrafts(state, action: PayloadAction<string>) {
      delete state[action.payload];
    },
  },
});

export const { addWalkDrafts, clearWalkDrafts, discardWalkDraft } = walkDraftsSlice.actions;

const noDrafts: readonly WalkDraft[] = [];

export function selectWalkDrafts(
  state: { walkDrafts: WalkDraftsState },
  logId: string,
): readonly WalkDraft[] {
  return state.walkDrafts[logId] ?? noDrafts;
}
