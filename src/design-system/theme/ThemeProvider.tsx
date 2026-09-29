import { createContext, type ReactNode, useContext, useMemo } from 'react';
import { StyleSheet } from 'react-native';

import type { Scheme } from '../types';
import { createTheme, type Theme } from './theme';

const ThemeContext = createContext<Theme | null>(null);

interface ThemeProviderProps {
  scheme: Scheme;
  children: ReactNode;
}

/**
 * Provides the theme for a scheme. The design system never reads the store:
 * the app decides the scheme and passes it in.
 */
export function ThemeProvider({ scheme, children }: ThemeProviderProps) {
  const theme = useMemo(() => createTheme(scheme), [scheme]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme must be used inside a ThemeProvider');
  return theme;
}

/**
 * Declares theme-aware styles once, outside the component. The returned hook rebuilds
 * the StyleSheet only when the theme changes.
 *
 *   const useStyles = makeStyles((t) => ({ box: { padding: t.spacing[4] } }));
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(factory: (theme: Theme) => T) {
  return function useStyles(): T {
    const theme = useTheme();
    return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
  };
}
