import { Provider } from 'react-redux';

import { AppThemeProvider } from '@/features/settings/AppThemeProvider';
import { AppShell } from '@/features/shell/AppShell';
import { ErrorBoundary } from '@/features/common/ErrorBoundary';
import { store } from '@/store/store';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppThemeProvider>
        <ErrorBoundary>
          <AppShell />
        </ErrorBoundary>
      </AppThemeProvider>
    </Provider>
  );
}
