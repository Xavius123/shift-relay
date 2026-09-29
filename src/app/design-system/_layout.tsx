import { Stack } from 'expo-router';

import { useStackScreenOptions } from '@/features/shell/useStackScreenOptions';
import { MenuButton } from '@/features/shell/ShellMenu';

export default function DesignSystemLayout() {
  return (
    <Stack screenOptions={useStackScreenOptions()}>
      <Stack.Screen
        name="index"
        options={{ title: 'Design system', headerLeft: () => <MenuButton /> }}
      />
    </Stack>
  );
}
