import { ActivityIndicator, Pressable, Text } from 'react-native';

import { makeStyles, useTheme } from '../../theme/ThemeProvider';
import type { ButtonVariant, Size } from '../../types';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: Size;
  onPress: () => void;
  disabled?: boolean;
  /** Shows a spinner and blocks presses. */
  loading?: boolean;
  /** Defaults to the label. */
  accessibilityLabel?: string;
  testID?: string;
  children: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  loading = false,
  accessibilityLabel,
  testID,
  children,
}: ButtonProps) {
  const styles = useStyles();
  const theme = useTheme();
  const blocked = disabled || loading;
  // sm is shorter than the touch target; hitSlop brings its hit area up to it.
  const hitSlop = size === 'sm' ? { top: theme.spacing[2], bottom: theme.spacing[2] } : undefined;

  return (
    <Pressable
      onPress={onPress}
      disabled={blocked}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? children}
      aria-disabled={disabled}
      aria-busy={loading}
      {...(hitSlop ? { hitSlop } : {})}
      {...(testID !== undefined ? { testID } : {})}
      style={({ pressed }) => [
        styles.root,
        styles[`${size}Box`],
        styles[`${variant}Box`],
        pressed && !blocked && styles[`${variant}Pressed`],
        disabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={styles[`${variant}Label`].color}
          accessibilityLabel="Loading"
        />
      ) : (
        <Text style={[styles.label, styles[`${size}Label`], styles[`${variant}Label`]]}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  root: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderRadius: t.radius.md,
    borderWidth: 1,
  },
  label: { fontWeight: t.fontWeight.semibold },
  smBox: { paddingVertical: t.spacing[2], paddingHorizontal: t.spacing[3] },
  mdBox: {
    minHeight: t.size.touchTarget,
    paddingVertical: t.spacing[2],
    paddingHorizontal: t.spacing[4],
  },
  lgBox: {
    minHeight: t.size.control.lg,
    paddingVertical: t.spacing[3],
    paddingHorizontal: t.spacing[6],
  },
  smLabel: { fontSize: t.fontSize.sm, lineHeight: t.fontSize.sm * t.lineHeight.tight },
  mdLabel: { fontSize: t.fontSize.base, lineHeight: t.fontSize.base * t.lineHeight.tight },
  lgLabel: { fontSize: t.fontSize.lg, lineHeight: t.fontSize.lg * t.lineHeight.tight },
  primaryBox: { backgroundColor: t.color.accent, borderColor: t.color.accent },
  primaryPressed: { backgroundColor: t.color.accentActive, borderColor: t.color.accentActive },
  primaryLabel: { color: t.color.accentFg },
  secondaryBox: { backgroundColor: t.color.bgSubtle, borderColor: t.color.bgSubtle },
  secondaryPressed: {
    backgroundColor: t.color.bgSubtleHover,
    borderColor: t.color.bgSubtleHover,
  },
  secondaryLabel: { color: t.color.text },
  outlineBox: { backgroundColor: 'transparent', borderColor: t.color.border },
  outlinePressed: { backgroundColor: t.color.bgSubtleHover },
  outlineLabel: { color: t.color.text },
  ghostBox: { backgroundColor: 'transparent', borderColor: 'transparent' },
  ghostPressed: { backgroundColor: t.color.bgSubtle },
  ghostLabel: { color: t.color.accent },
  dangerBox: { backgroundColor: t.color.error, borderColor: t.color.error },
  dangerPressed: { opacity: t.opacity.pressed },
  dangerLabel: { color: t.color.textInverse },
  disabled: { opacity: t.opacity.disabled },
}));
