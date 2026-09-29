import type { ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { ThemeProvider } from '@/design-system';
import { useAppSelector } from '@/store/hooks';

import { selectAccent, selectColorScheme } from './uiSlice';

/** Connects the design system's ThemeProvider to uiSlice, resolving `system` from the device. */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const preference = useAppSelector(selectColorScheme);
  const accent = useAppSelector(selectAccent);
  const device = useColorScheme();
  const scheme = preference === 'system' ? (device === 'dark' ? 'dark' : 'light') : preference;

  return (
    <ThemeProvider scheme={scheme} accent={accent}>
      {children}
    </ThemeProvider>
  );
}
