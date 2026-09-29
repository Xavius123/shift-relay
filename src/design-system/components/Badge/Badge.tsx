import { Text, View } from 'react-native';

import { makeStyles } from '../../theme/ThemeProvider';
import type { StatusVariant } from '../../types';

export interface BadgeProps {
  variant?: StatusVariant;
  children: string | number;
  /** Numbers above this show as `{max}+`. */
  max?: number;
  testID?: string;
}

export function Badge({ variant = 'default', children, max, testID }: BadgeProps) {
  const styles = useStyles();
  const label =
    typeof children === 'number' && max !== undefined && children > max ? `${max}+` : children;
  return (
    <View
      style={[styles.root, styles[`${variant}Bg`]]}
      {...(testID !== undefined ? { testID } : {})}
    >
      <Text style={[styles.label, styles[`${variant}Fg`]]}>{label}</Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: {
    alignSelf: 'flex-start',
    borderRadius: t.radius.full,
    paddingHorizontal: t.spacing[2],
    paddingVertical: t.spacing[1] / 2,
  },
  label: {
    fontSize: t.fontSize.xs,
    lineHeight: t.fontSize.xs * t.lineHeight.normal,
    fontWeight: t.fontWeight.semibold,
  },
  defaultBg: { backgroundColor: t.color.bgSubtle },
  defaultFg: { color: t.color.textMuted },
  accentBg: { backgroundColor: t.color.accent },
  accentFg: { color: t.color.accentFg },
  successBg: { backgroundColor: t.color.successBg },
  successFg: { color: t.color.success },
  errorBg: { backgroundColor: t.color.errorBg },
  errorFg: { color: t.color.error },
  warningBg: { backgroundColor: t.color.warningBg },
  warningFg: { color: t.color.warning },
  infoBg: { backgroundColor: t.color.infoBg },
  infoFg: { color: t.color.info },
}));
