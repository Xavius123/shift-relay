import type { ShiftPhase } from '@/features/logs/types';

import type { DemoAccountId, DemoRole } from './sessionSlice';

export const demoAccounts = {
  jordan: {
    name: 'Jordan Lee',
    title: 'Morning Shift Manager',
    description: 'Run Morning operations and send the Midday handoff to Night.',
    role: 'shiftManager',
    shift: 'morning',
  },
  avery: {
    name: 'Avery Morgan',
    title: 'Night Shift Manager',
    description: 'Receive the Midday handoff and prepare the next Morning shift.',
    role: 'shiftManager',
    shift: 'night',
  },
  elena: {
    name: 'Elena Ruiz',
    title: 'Operations Manager',
    description: 'Observe handoffs and issues without signing operational work.',
    role: 'manager',
    shift: null,
  },
} as const satisfies Record<
  DemoAccountId,
  {
    name: string;
    title: string;
    description: string;
    role: DemoRole;
    /** The shift a Shift Manager runs; null for the Operations Manager. */
    shift: 'morning' | 'night' | null;
  }
>;

/**
 * Which of today's rows an account needs on its Daily Sheet. Morning stops at the handoff it
 * sends; Night, the Operations Manager, and signed-out viewers see all three.
 */
export function visiblePhases(accountId: DemoAccountId | null): readonly ShiftPhase[] {
  if (accountId !== null && demoAccounts[accountId].shift === 'morning') {
    return ['morning', 'midday'];
  }
  return ['morning', 'midday', 'night'];
}

export function demoActor(accountId: DemoAccountId | null): string {
  return accountId ? demoAccounts[accountId].name : 'Demo reviewer';
}

export function isShiftManagerAccount(accountId: DemoAccountId | null): boolean {
  return accountId !== null && demoAccounts[accountId].role === 'shiftManager';
}
