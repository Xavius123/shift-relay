import type { ColorTokens } from '@/design-system';

// Page content for the design system review page. The values themselves come from the
// generated theme; this file only says which tokens to show and which pairs to check.

export interface SemanticRow {
  token: keyof ColorTokens;
  light: string;
  dark: string;
  use: string;
}

export const semanticRows: readonly SemanticRow[] = [
  { token: 'bg', light: 'ink.50', dark: 'ink.950', use: 'Screen background' },
  { token: 'surface', light: 'ink.0', dark: 'ink.900', use: 'Cards, grouped sections' },
  { token: 'bgSubtle', light: 'ink.100', dark: 'ink.800', use: 'Filter row, subtle fill' },
  { token: 'text', light: 'ink.900', dark: 'ink.50', use: 'Primary text' },
  { token: 'textMuted', light: 'ink.600', dark: 'ink.300', use: 'Metadata, labels' },
  { token: 'textSubtle', light: 'ink.500', dark: 'ink.400', use: 'Hints, timestamps' },
  { token: 'border', light: 'ink.200', dark: 'ink.800', use: 'Dividers, card edges' },
  { token: 'accent', light: 'accent.600', dark: 'accent.400', use: 'The one primary action' },
  { token: 'accentFg', light: 'ink.0', dark: 'ink.950', use: 'Text on accent' },
  { token: 'borderFocus', light: 'accent.500', dark: 'accent.400', use: 'Focus ring' },
];

export interface ContrastPair {
  fg: keyof ColorTokens;
  bg: keyof ColorTokens;
  min: number;
  // A pair the design rules forbid. Shown to explain the rule, expected to fail.
  banned?: true;
}

// A readable subset of what scripts/check-contrast.mjs enforces on every build.
export const contrastPairs: readonly ContrastPair[] = [
  { fg: 'text', bg: 'bg', min: 4.5 },
  { fg: 'textMuted', bg: 'bg', min: 4.5 },
  { fg: 'textSubtle', bg: 'bg', min: 4.5 },
  { fg: 'textMuted', bg: 'bgSubtle', min: 4.5 },
  { fg: 'accent', bg: 'surface', min: 4.5 },
  { fg: 'accentFg', bg: 'accent', min: 4.5 },
  { fg: 'success', bg: 'successBg', min: 4.5 },
  { fg: 'warning', bg: 'warningBg', min: 4.5 },
  { fg: 'error', bg: 'errorBg', min: 4.5 },
  { fg: 'info', bg: 'infoBg', min: 4.5 },
  { fg: 'textSubtle', bg: 'bgSubtle', min: 4.5, banned: true },
];

function channel(value: number): number {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  );
}

/** WCAG 2.x contrast ratio between two #RRGGBB colors. Same formula as check-contrast.mjs. */
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
