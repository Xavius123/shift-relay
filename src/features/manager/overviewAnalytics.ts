import { demoAccounts } from '@/features/auth/demoAccounts';
import { localDateKey, phaseOrder } from '@/features/logs/logTemplates';
import type { Issue } from '@/features/issues/types';
import type { ShiftLog } from '@/features/logs/types';

const periodDays = 7;

export type PeriodKey = 'current' | 'previous' | 'twoWeeksAgo';

export interface PeriodMetrics {
  key: PeriodKey;
  label: string;
  /** Inclusive local date keys (YYYY-MM-DD). */
  start: string;
  end: string;
  scheduled: number;
  complete: number;
  awaitingApproval: number;
  raised: number;
}

export interface OverviewMetrics {
  periods: PeriodMetrics[];
  openIssues: Issue[];
}

const periodDefinitions = [
  { key: 'current', label: 'Current', offset: 0 },
  { key: 'previous', label: 'Previous', offset: 1 },
  { key: 'twoWeeksAgo', label: 'Two weeks ago', offset: 2 },
] as const satisfies readonly { key: PeriodKey; label: string; offset: number }[];

function daysBefore(today: Date, days: number): string {
  const date = new Date(today);
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return localDateKey(date);
}

/** Morning and Night need their one signature; Midday needs Jordan's send and Avery's receipt. */
function isLogComplete(log: ShiftLog): boolean {
  if (log.status !== 'signedOff') return false;
  if (log.phase !== 'midday') return log.signOffs.length === 1;
  const [sent, received] = log.signOffs;
  return (
    log.signOffs.length === 2 &&
    sent?.actor === demoAccounts.jordan.name &&
    received?.actor === demoAccounts.avery.name
  );
}

export function percent(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 100);
}

const inRange = (date: string, start: string, end: string) => date >= start && date <= end;

/** Three rolling seven-day periods on the device-local calendar, newest first. */
export function computeOverview(
  logs: readonly ShiftLog[],
  issues: readonly Issue[],
  today: Date,
): OverviewMetrics {
  const periods = periodDefinitions.map(({ key, label, offset }): PeriodMetrics => {
    const end = daysBefore(today, offset * periodDays);
    const start = daysBefore(today, offset * periodDays + periodDays - 1);
    const periodLogs = logs.filter((log) => inRange(log.operationalDate, start, end));
    const dateOf = (iso: string) => localDateKey(new Date(iso));
    return {
      key,
      label,
      start,
      end,
      scheduled: periodDays * phaseOrder.length,
      complete: periodLogs.filter(isLogComplete).length,
      awaitingApproval: periodLogs.filter((log) => log.status === 'awaitingSecondSignOff').length,
      raised: issues.filter((item) => inRange(dateOf(item.raisedAt), start, end)).length,
    };
  });

  const openIssues = issues
    .filter((item) => item.status === 'open')
    .sort((left, right) => right.raisedAt.localeCompare(left.raisedAt));

  return { periods, openIssues };
}
