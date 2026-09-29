// Shared variant and size unions. Components reuse these; never redefine them per component.
import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

export type Size = 'sm' | 'md' | 'lg';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';

export type StatusVariant = 'default' | 'accent' | 'success' | 'error' | 'warning' | 'info';

export type CardVariant = 'default' | 'elevated' | 'interactive';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export type TextVariant = 'heading' | 'title' | 'body' | 'bodySm' | 'caption';

export type TextTone = 'default' | 'muted' | 'subtle' | 'inverse' | 'accent' | 'error';

export type FontWeightName = 'regular' | 'medium' | 'semibold' | 'bold';

export type { Accent, Scheme } from './tokens/generated';

/** What the user picked. `system` follows the device setting. */
export type ColorSchemePreference = 'system' | 'light' | 'dark';

/** The name of an Ionicons glyph. */
export type IconName = ComponentProps<typeof Ionicons>['name'];
