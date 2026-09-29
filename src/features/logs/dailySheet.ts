import type { DemoAccountId } from '@/features/auth/sessionSlice';

import { phaseOrder } from './logTemplates';
import type { ShiftLog } from './types';

/** A Daily Sheet is derived from the three logs of one operational date; it is never stored. */
export interface DailySheet {
  date: string;
  logs: ShiftLog[];
}

export type DailySheetStatus = 'notStarted' | 'inProgress' | 'complete';

export type NextAction =
  { kind: 'form'; label: string; logId: string } | { kind: 'waiting'; label: string };

export const dailySheetStatusLabels = {
  notStarted: 'Not started',
  inProgress: 'In progress',
  complete: 'Complete',
} as const satisfies Record<DailySheetStatus, string>;

export function groupDailySheets(logs: readonly ShiftLog[]): DailySheet[] {
  const groups = new Map<string, ShiftLog[]>();
  for (const log of logs) {
    const group = groups.get(log.operationalDate) ?? [];
    group.push(log);
    groups.set(log.operationalDate, group);
  }
  return [...groups.entries()]
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([date, entries]) => ({
      date,
      logs: [...entries].sort(
        (left, right) => phaseOrder.indexOf(left.phase) - phaseOrder.indexOf(right.phase),
      ),
    }));
}

export function dailySheetStatus(logs: readonly ShiftLog[]): DailySheetStatus {
  if (logs.length === phaseOrder.length && logs.every((log) => log.status === 'signedOff')) {
    return 'complete';
  }
  return logs.some((log) => log.signOffs.length > 0) ? 'inProgress' : 'notStarted';
}

/** Written status of one row in a Daily Sheet. Midday reads as a handoff between managers. */
export function logStatusLabel(log: Pick<ShiftLog, 'phase' | 'status'>): string {
  if (log.phase === 'midday') {
    if (log.status === 'pending') return 'Not sent';
    return log.status === 'awaitingSecondSignOff' ? 'Awaiting Night' : 'Received';
  }
  return log.status === 'signedOff' ? 'Signed off' : 'Pending';
}

/** Where the day stands, in words, for any viewer. */
export function sheetStage(logs: readonly ShiftLog[]): string {
  const status = (phase: ShiftLog['phase']) => logs.find((log) => log.phase === phase)?.status;
  if (status('morning') !== 'signedOff') return 'Morning not complete';
  if (status('midday') === 'pending') return 'Waiting for Morning handoff';
  if (status('midday') === 'awaitingSecondSignOff') return 'Handoff waiting on Night';
  if (status('night') !== 'signedOff') return 'Night not complete';
  return 'Daily Sheet complete';
}

/** The one thing the signed-in Shift Manager should do next on this sheet. */
export function nextActionFor(
  accountId: DemoAccountId | null,
  logs: readonly ShiftLog[],
): NextAction {
  const find = (phase: ShiftLog['phase']) => logs.find((log) => log.phase === phase);
  const morning = find('morning');
  const midday = find('midday');
  const night = find('night');
  if (!morning || !midday || !night) return { kind: 'waiting', label: 'Daily Sheet unavailable' };
  if (dailySheetStatus(logs) === 'complete')
    return { kind: 'waiting', label: 'Daily Sheet complete' };

  if (accountId === 'jordan') {
    if (morning.status === 'pending') {
      return { kind: 'form', label: 'Complete Morning', logId: morning.id };
    }
    if (midday.status === 'pending') {
      return { kind: 'form', label: 'Send handoff to Night', logId: midday.id };
    }
    return { kind: 'waiting', label: 'Waiting for Night' };
  }

  if (accountId === 'avery') {
    if (morning.status === 'pending') return { kind: 'waiting', label: 'Morning not complete' };
    if (midday.status === 'pending') {
      return { kind: 'waiting', label: 'Waiting for Morning handoff' };
    }
    if (midday.status === 'awaitingSecondSignOff') {
      return { kind: 'form', label: 'Receive handoff', logId: midday.id };
    }
    return { kind: 'form', label: 'Complete Night', logId: night.id };
  }

  return { kind: 'waiting', label: sheetStage(logs) };
}
