import { Stack } from 'expo-router';

import { MenuButton } from '@/features/shell/ShellMenu';
import { useStackScreenOptions } from '@/features/shell/useStackScreenOptions';

export default function ShiftPhotosLayout() {
  return (
    <Stack screenOptions={useStackScreenOptions()}>
      <Stack.Screen
        name="index"
        options={{ title: 'Shift Photos', headerLeft: () => <MenuButton /> }}
      />
    </Stack>
  );
}
