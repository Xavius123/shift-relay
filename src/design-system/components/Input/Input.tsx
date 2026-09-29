import { useState } from 'react';
import { TextInput, type TextInputProps, View } from 'react-native';

import { makeStyles, useTheme } from '../../theme/ThemeProvider';
import type { Size } from '../../types';
import { Text } from '../Text/Text';

type PassThrough = Omit<
  TextInputProps,
  | 'style'
  | 'editable'
  | 'placeholderTextColor'
  | 'value'
  | 'onChangeText'
  | 'placeholder'
  | 'testID'
>;

export interface InputProps extends PassThrough {
  /** Always visible; never placeholder-only. */
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  helperText?: string;
  /** Replaces helperText and marks the field invalid. */
  error?: string;
  size?: Exclude<Size, 'sm'>;
  disabled?: boolean;
  /** On the root. The text field itself gets `{testID}-field`. */
  testID?: string;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  helperText,
  error,
  size = 'md',
  disabled = false,
  testID,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const styles = useStyles();
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const invalid = error !== undefined;
  const message = error ?? helperText;

  return (
    <View style={styles.root} {...(testID !== undefined ? { testID } : {})}>
      <Text variant="bodySm" weight="medium">
        {label}
      </Text>
      <TextInput
        {...rest}
        value={value}
        onChangeText={onChangeText}
        {...(placeholder !== undefined ? { placeholder } : {})}
        placeholderTextColor={theme.color.textPlaceholder}
        editable={!disabled}
        accessibilityLabel={label}
        aria-disabled={disabled}
        {...(testID !== undefined ? { testID: `${testID}-field` } : {})}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          styles.field,
          styles[size],
          focused && styles.focused,
          invalid && styles.invalid,
          disabled && styles.disabled,
        ]}
      />
      {message !== undefined ? (
        <View {...(invalid ? { role: 'alert' as const } : {})}>
          <Text variant="caption" tone={invalid ? 'error' : 'muted'}>
            {message}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { gap: t.spacing[1] },
  field: {
    backgroundColor: t.color.bg,
    color: t.color.text,
    borderWidth: 1,
    borderColor: t.color.borderInput,
    borderRadius: t.radius.md,
    paddingHorizontal: t.spacing[3],
  },
  md: { minHeight: t.size.control.md, fontSize: t.fontSize.base },
  lg: { minHeight: t.size.control.lg, fontSize: t.fontSize.lg },
  focused: { borderColor: t.color.borderFocus },
  invalid: { borderColor: t.color.error },
  disabled: { opacity: t.opacity.disabled },
}));
