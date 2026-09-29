import { Pressable, Text, View } from 'react-native';

import { type ColorSchemePreference, makeStyles } from '@/design-system';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { selectColorScheme, setColorScheme } from './uiSlice';

const schemeOptions: readonly { value: ColorSchemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

/** Color scheme picker. It writes to uiSlice, so the whole app re-themes. */
export function ThemeControls() {
  const styles = useStyles();
  const dispatch = useAppDispatch();
  const colorScheme = useAppSelector(selectColorScheme);

  return (
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
  );
}

interface ChoiceProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID: string;
  accessibilityLabel: string;
}

function Choice({ label, selected, onPress, testID, accessibilityLabel }: ChoiceProps) {
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
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
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
  label: { color: t.color.textMuted, fontSize: t.fontSize.sm, fontWeight: t.fontWeight.medium },
  labelSelected: { color: t.color.text },
}));
