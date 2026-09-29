import type { Stack } from 'expo-router';
import type { ComponentProps } from 'react';

import { useTheme } from '@/design-system';

import { HeaderActions } from './HeaderActions';

type StackScreenOptions = NonNullable<ComponentProps<typeof Stack>['screenOptions']>;

/** The top bar every section's stack shares: themed, flat, with the theme toggle and Sign out on the right. */
export function useStackScreenOptions(): StackScreenOptions {
  const theme = useTheme();
  return {
    headerStyle: { backgroundColor: theme.color.surface },
    headerTintColor: theme.color.text,
    headerTitleStyle: { fontWeight: theme.fontWeight.semibold },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: theme.color.bg },
    headerRight: () => <HeaderActions />,
  };
}
