import { Stack } from 'expo-router';

import { MenuButton } from '@/features/shell/ShellMenu';
import { useStackScreenOptions } from '@/features/shell/useStackScreenOptions';

export default function DashboardLayout() {
  return (
    <Stack screenOptions={useStackScreenOptions()}>
      <Stack.Screen
        name="index"
        options={{ title: 'Dashboard', headerLeft: () => <MenuButton /> }}
      />
      <Stack.Screen name="report/[date]" options={{ title: 'Daily Report' }} />
    </Stack>
  );
}
