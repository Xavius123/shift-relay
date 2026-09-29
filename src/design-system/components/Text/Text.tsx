import type { ReactNode } from 'react';
import { Text as RNText } from 'react-native';

import { makeStyles } from '../../theme/ThemeProvider';
import type { FontWeightName, TextTone, TextVariant } from '../../types';

export interface TextProps {
  variant?: TextVariant;
  tone?: TextTone;
  /** Overrides the variant's default weight. */
  weight?: FontWeightName;
  numberOfLines?: number;
  testID?: string;
  children?: ReactNode;
}

/** The only way to render text: type scale and color always come from tokens. */
export function Text({
  variant = 'body',
  tone = 'default',
  weight,
  numberOfLines,
  testID,
  children,
}: TextProps) {
  const styles = useStyles();
  const isHeader = variant === 'heading' || variant === 'title';
  return (
    <RNText
      style={[styles[variant], styles[tone], weight ? styles[weight] : null]}
      accessibilityRole={isHeader ? 'header' : 'text'}
      {...(numberOfLines !== undefined ? { numberOfLines } : {})}
      {...(testID !== undefined ? { testID } : {})}
    >
      {children}
    </RNText>
  );
}

const useStyles = makeStyles((t) => ({
  heading: {
    fontSize: t.fontSize['3xl'],
    lineHeight: t.fontSize['3xl'] * t.lineHeight.tight,
    fontWeight: t.fontWeight.bold,
  },
  title: {
    fontSize: t.fontSize.xl,
    lineHeight: t.fontSize.xl * t.lineHeight.tight,
    fontWeight: t.fontWeight.semibold,
  },
  body: {
    fontSize: t.fontSize.base,
    lineHeight: t.fontSize.base * t.lineHeight.normal,
    fontWeight: t.fontWeight.regular,
  },
  bodySm: {
    fontSize: t.fontSize.sm,
    lineHeight: t.fontSize.sm * t.lineHeight.normal,
    fontWeight: t.fontWeight.regular,
  },
  caption: {
    fontSize: t.fontSize.xs,
    lineHeight: t.fontSize.xs * t.lineHeight.normal,
    fontWeight: t.fontWeight.regular,
  },
  default: { color: t.color.text },
  muted: { color: t.color.textMuted },
  subtle: { color: t.color.textSubtle },
  inverse: { color: t.color.textInverse },
  accent: { color: t.color.accent },
  error: { color: t.color.error },
  regular: { fontWeight: t.fontWeight.regular },
  medium: { fontWeight: t.fontWeight.medium },
  semibold: { fontWeight: t.fontWeight.semibold },
  bold: { fontWeight: t.fontWeight.bold },
}));
