import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable } from 'react-native';

import { makeStyles, useTheme } from '@/design-system';

/** An X that dismisses the surface it sits on: a modal, a drawer, a notice. */
export function CloseButton({
  onPress,
  accessibilityLabel,
  testID,
  disabled = false,
}: {
  onPress: () => void;
  accessibilityLabel: string;
  testID?: string;
  disabled?: boolean;
}) {
  const styles = useStyles();
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      testID={testID}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Ionicons name="close" size={theme.fontSize['2xl']} color={theme.color.text} />
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
  disabled: { opacity: t.opacity.disabled },
}));
