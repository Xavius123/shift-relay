// Public API of the design system. Features import from '@/design-system' only.
export { makeStyles, ThemeProvider, useTheme } from './theme/ThemeProvider';
export { createTheme, type Theme } from './theme/theme';
export type { ColorTokens } from './tokens/generated';
export type * from './types';

export { Badge, type BadgeProps } from './components/Badge';
export { Button, type ButtonProps } from './components/Button';
export { Card, type CardProps } from './components/Card';
export { Input, type InputProps } from './components/Input';
export { Text, type TextProps } from './components/Text';
