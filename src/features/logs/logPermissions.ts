import { demoAccounts } from '@/features/auth/demoAccounts';
import type { DemoAccountId } from '@/features/auth/sessionSlice';

import { localDateKey } from './logTemplates';
import type { ShiftLog } from './types';

type SignableLog = Pick<ShiftLog, 'phase' | 'status'>;

export function requiredSignerAccountId(log: SignableLog): DemoAccountId | null {
  if (log.status === 'signedOff') return null;
  if (log.status === 'awaitingSecondSignOff') return 'avery';
  return log.phase === 'night' ? 'avery' : 'jordan';
}

/**
 * The day runs in order: Morning, then the Midday handoff, then Night.
 * Returns why `log` cannot be signed yet, or null when its turn has come.
 */
export function sequenceBlockMessage(
  log: SignableLog,
  dayLogs: readonly SignableLog[],
): string | null {
  if (log.status !== 'pending') return null;
  const statusOf = (phase: ShiftLog['phase']) =>
    dayLogs.find((item) => item.phase === phase)?.status;
  if (log.phase === 'midday' && statusOf('morning') !== 'signedOff') {
    return 'Complete Morning before sending the handoff to Night.';
  }
  if (log.phase === 'night' && statusOf('midday') !== 'signedOff') {
    return 'Receive the Midday handoff before completing Night.';
  }
  return null;
}

export function canSignLog(
  accountId: DemoAccountId | null,
  log: SignableLog,
  dayLogs: readonly SignableLog[],
): boolean {
  return (
    accountId !== null &&
    accountId === requiredSignerAccountId(log) &&
    sequenceBlockMessage(log, dayLogs) === null
  );
}

/** Checks toggle only on today's pending log, for the account whose turn it is. */
export function canToggleChecks(
  accountId: DemoAccountId | null,
  log: Pick<ShiftLog, 'phase' | 'status' | 'operationalDate'>,
  dayLogs: readonly SignableLog[],
  today: string = localDateKey(new Date()),
): boolean {
  return (
    log.status === 'pending' && log.operationalDate === today && canSignLog(accountId, log, dayLogs)
  );
}

/** Shift photos can be discarded before saving; once saved, only the Operations Manager deletes them. */
export function canDeleteWalkPhotos(accountId: DemoAccountId | null): boolean {
  return accountId !== null && demoAccounts[accountId].role === 'manager';
}

export function requiredSignerMessage(log: SignableLog): string {
  const accountId = requiredSignerAccountId(log);
  if (!accountId) return 'This log is already signed off.';
  const account = demoAccounts[accountId];
  return `${account.name}, ${account.title}, must provide this sign-off.`;
}
