import { combineSlices, configureStore } from '@reduxjs/toolkit';

import { sessionSlice } from '@/features/auth/sessionSlice';
import { devSlice } from '@/features/dev/devSlice';
import { logsApi } from '@/features/logs/logsApi';
import { walkDraftsSlice } from '@/features/logs/walkDraftsSlice';
import { uiSlice } from '@/features/settings/uiSlice';

const rootReducer = combineSlices(uiSlice, sessionSlice, devSlice, walkDraftsSlice, logsApi);

export function makeStore() {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logsApi.middleware),
  });
}

export const store = makeStore();

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
