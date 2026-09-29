import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import type { ShiftPhase } from './types';

export const phaseOrder = ['morning', 'midday', 'night'] as const satisfies readonly ShiftPhase[];

/** Time of day, as a set: sun for Morning, sun and cloud for the Midday handoff, moon for Night. */
export const phaseIcons = {
  morning: 'sunny-outline',
  midday: 'partly-sunny-outline',
  night: 'moon-outline',
} as const satisfies Record<ShiftPhase, ComponentProps<typeof Ionicons>['name']>;

export const phaseLabels = {
  morning: 'Morning',
  midday: 'Midday',
  night: 'Night',
} as const satisfies Record<ShiftPhase, string>;

export const phaseDescriptions = {
  morning: 'Check restock status before the shift opens.',
  midday: 'Send the Morning handoff and record Night receiving it.',
  night: 'Stage restock, or record any shortage, before the shift closes.',
} as const satisfies Record<ShiftPhase, string>;

/** One required check per shift, and it is about restock. */
export const confirmationTemplates = {
  morning: ['Restock status checked'],
  midday: ['Restock status handed off'],
  night: ['Restock staged or shortage recorded'],
} as const satisfies Record<ShiftPhase, readonly [string]>;

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function logId(date: string, phase: ShiftPhase): string {
  return `LOG-${date}-${phase}`;
}
