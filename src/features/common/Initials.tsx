import { Text, View } from 'react-native';

import { makeStyles, type Theme } from '@/design-system';

/** "Jordan Lee" → "JL"; a single name gives one letter. */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? '?';
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : '';
  return `${first}${last}`.toUpperCase();
}

type Tint = 'info' | 'success' | 'warning' | 'accent';
const tints: readonly Tint[] = ['info', 'success', 'warning', 'accent'];

/** The same person gets the same tint everywhere. */
function tintOf(name: string): Tint {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return tints[hash % tints.length] ?? 'info';
}

/**
 * Who filled out a form, as initials in circles. Several signers overlap, first on the left.
 * Decorative next to a written name; pass `label` when the initials stand alone.
 */
export function Initials({
  names,
  size = 'sm',
  label,
  testID,
}: {
  names: readonly string[];
  size?: 'sm' | 'md';
  label?: string;
  testID?: string;
}) {
  const styles = useStyles();
  if (names.length === 0) return null;
  return (
    <View
      style={styles.stack}
      testID={testID}
      {...(label
        ? { accessible: true, accessibilityLabel: label }
        : { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' })}
    >
      {names.map((name, index) => {
        const tint = tintOf(name);
        return (
          <View
            key={`${name}-${index}`}
            style={[
              styles.circle,
              size === 'md' ? styles.md : styles.sm,
              styles[tint],
              index > 0 && styles.overlap,
            ]}
          >
            <Text
              style={[styles.letters, styles[`${tint}Text`]]}
              {...(testID ? { testID: `${testID}-${index}` } : {})}
            >
              {initialsOf(name)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((t: Theme) => ({
  stack: { flexDirection: 'row', alignItems: 'center' },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radius.full,
    borderWidth: t.spacing[1] / 2,
    borderColor: t.color.surface,
  },
  sm: { width: t.spacing[6], height: t.spacing[6] },
  md: { width: t.spacing[8], height: t.spacing[8] },
  overlap: { marginLeft: -t.spacing[2] },
  letters: { fontSize: t.fontSize.xs, fontWeight: t.fontWeight.semibold },
  info: { backgroundColor: t.color.infoBg },
  success: { backgroundColor: t.color.successBg },
  warning: { backgroundColor: t.color.warningBg },
  accent: { backgroundColor: t.color.accent },
  infoText: { color: t.color.info },
  successText: { color: t.color.success },
  warningText: { color: t.color.warning },
  accentText: { color: t.color.accentFg },
}));
