import { Pressable, Text, View } from 'react-native';

import {
  type Accent,
  type ColorSchemePreference,
  createTheme,
  makeStyles,
  type Scheme,
  useTheme,
} from '@/design-system';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { selectAccent, selectColorScheme, setAccent, setColorScheme } from './uiSlice';

const schemeOptions: readonly { value: ColorSchemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const themeAccentOptions = [
  { value: 'care', label: 'Care blue' },
  { value: 'plum', label: 'Plum' },
  { value: 'seaGlass', label: 'Sea glass' },
] as const satisfies readonly { value: Accent; label: string }[];

/** Color scheme and accent pickers. They write to uiSlice, so the whole app re-themes. */
export function ThemeControls() {
  const styles = useStyles();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const colorScheme = useAppSelector(selectColorScheme);
  const accent = useAppSelector(selectAccent);

  return (
    <View style={styles.root}>
      <View style={styles.group} accessibilityRole="radiogroup" accessibilityLabel="Color scheme">
        {schemeOptions.map((option) => (
          <Choice
            key={option.value}
            label={option.label}
            selected={colorScheme === option.value}
            onPress={() => dispatch(setColorScheme(option.value))}
            testID={`scheme-${option.value}`}
            accessibilityLabel={`${option.label} color scheme`}
          />
        ))}
      </View>
      <View style={styles.group} accessibilityRole="radiogroup" accessibilityLabel="Accent">
        {themeAccentOptions.map((option) => (
          <Choice
            key={option.value}
            label={option.label}
            selected={accent === option.value}
            onPress={() => dispatch(setAccent(option.value))}
            testID={`accent-${option.value}`}
            accessibilityLabel={`Accent ${option.label}`}
            swatch={swatchFor(option.value, theme.scheme)}
          />
        ))}
      </View>
    </View>
  );
}

function swatchFor(accent: Accent, scheme: Scheme): string {
  return createTheme(scheme, accent).color.accent;
}

interface ChoiceProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID: string;
  accessibilityLabel: string;
  swatch?: string;
}

function Choice({ label, selected, onPress, testID, accessibilityLabel, swatch }: ChoiceProps) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={accessibilityLabel}
      aria-checked={selected}
      testID={testID}
      style={({ pressed }) => [
        styles.choice,
        selected && styles.choiceSelected,
        pressed && styles.pressed,
      ]}
    >
      {swatch ? <View style={[styles.dot, { backgroundColor: swatch }]} /> : null}
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  root: { gap: t.spacing[2] },
  group: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing[2] },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[2],
    minHeight: t.size.touchTarget,
    paddingHorizontal: t.spacing[4],
    borderRadius: t.radius.full,
    borderWidth: 1,
    borderColor: t.color.border,
    backgroundColor: t.color.surface,
  },
  choiceSelected: { borderColor: t.color.accent, backgroundColor: t.color.bgSubtle },
  pressed: { opacity: t.opacity.pressed },
  dot: { width: t.spacing[3], height: t.spacing[3], borderRadius: t.radius.full },
  label: { color: t.color.textMuted, fontSize: t.fontSize.sm, fontWeight: t.fontWeight.medium },
  labelSelected: { color: t.color.text },
}));
