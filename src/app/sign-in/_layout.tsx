import { Stack } from 'expo-router';

import { MenuButton } from '@/features/shell/ShellMenu';
import { useStackScreenOptions } from '@/features/shell/useStackScreenOptions';

export default function SignInLayout() {
  return (
    <Stack screenOptions={useStackScreenOptions()}>
      <Stack.Screen name="index" options={{ title: 'Sign in', headerLeft: () => <MenuButton /> }} />
    </Stack>
  );
}
