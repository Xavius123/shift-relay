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
  morning: 'Review night notes, restock status, and carry-over priorities.',
  midday: 'Send the Morning handoff and record Night receiving it.',
  night: 'Check work areas, stage restock, and prepare morning priorities.',
} as const satisfies Record<ShiftPhase, string>;

export const confirmationTemplates = {
  morning: ['Night notes reviewed', 'Restock status checked', 'Carry-over priorities assigned'],
  midday: ['Completed work recorded', 'Remaining work reviewed', 'Night manager briefed'],
  night: [
    'Work areas checked',
    'Restock staged or shortage recorded',
    'Morning priorities recorded',
  ],
} as const satisfies Record<ShiftPhase, readonly [string, string, string]>;

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function logId(date: string, phase: ShiftPhase): string {
  return `LOG-${date}-${phase}`;
}
