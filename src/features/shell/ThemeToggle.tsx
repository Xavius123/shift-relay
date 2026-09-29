import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable } from 'react-native';

import { makeStyles, useTheme } from '@/design-system';
import { setColorScheme } from '@/features/settings/uiSlice';
import { useAppDispatch } from '@/store/hooks';

/** Header button: flips between light and dark. The design system screen has the full controls. */
export function ThemeToggle() {
  const styles = useStyles();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const next = theme.scheme === 'dark' ? 'light' : 'dark';

  return (
    <Pressable
      onPress={() => dispatch(setColorScheme(next))}
      accessibilityRole="button"
      accessibilityLabel={`Switch to ${next} mode`}
      testID="theme-toggle"
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons
        name={theme.scheme === 'dark' ? 'sunny-outline' : 'moon-outline'}
        size={theme.fontSize.xl}
        color={theme.color.text}
      />
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  button: {
    minWidth: t.size.touchTarget,
    minHeight: t.size.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radius.full,
  },
  pressed: { backgroundColor: t.color.bgSubtle },
}));
