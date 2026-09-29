import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { type Accent, type ColorSchemePreference, defaultAccent } from '@/design-system';
import { defaultLogSort, type LogSort } from '@/features/logs/logFilters';

export type IssuesFilter = 'open' | 'resolved' | 'all';

export interface UiState {
  colorScheme: ColorSchemePreference;
  accent: Accent;
  /** Logs screen: free-text filter and whether rows are grouped into Daily Sheets. */
  logsSearch: string;
  logsGroupByDay: boolean;
  logsSort: LogSort;
  issuesFilter: IssuesFilter;
}

const initialState: UiState = {
  colorScheme: 'light',
  accent: defaultAccent,
  logsSearch: '',
  logsGroupByDay: true,
  logsSort: defaultLogSort,
  issuesFilter: 'open',
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setColorScheme(state, action: PayloadAction<ColorSchemePreference>) {
      state.colorScheme = action.payload;
    },
    setAccent(state, action: PayloadAction<Accent>) {
      state.accent = action.payload;
    },
    setLogsSearch(state, action: PayloadAction<string>) {
      state.logsSearch = action.payload;
    },
    setLogsGroupByDay(state, action: PayloadAction<boolean>) {
      state.logsGroupByDay = action.payload;
    },
    setLogsSort(state, action: PayloadAction<LogSort>) {
      state.logsSort = action.payload;
    },
    setIssuesFilter(state, action: PayloadAction<IssuesFilter>) {
      state.issuesFilter = action.payload;
    },
  },
  selectors: {
    selectColorScheme: (state) => state.colorScheme,
    selectAccent: (state) => state.accent,
    selectLogsSearch: (state) => state.logsSearch,
    selectLogsGroupByDay: (state) => state.logsGroupByDay,
    selectLogsSort: (state) => state.logsSort,
    selectIssuesFilter: (state) => state.issuesFilter,
  },
});

export const {
  setColorScheme,
  setAccent,
  setLogsSearch,
  setLogsGroupByDay,
  setLogsSort,
  setIssuesFilter,
} = uiSlice.actions;
export const {
  selectColorScheme,
  selectAccent,
  selectLogsSearch,
  selectLogsGroupByDay,
  selectLogsSort,
  selectIssuesFilter,
} = uiSlice.selectors;
