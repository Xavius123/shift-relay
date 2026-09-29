import { groupDailySheets, logStatusLabel, type DailySheet } from './dailySheet';
import { phaseLabels, phaseOrder } from './logTemplates';
import type { ShiftLog } from './types';

const dayFormat = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});

export function formatOperationalDate(date: string): string {
  return dayFormat.format(new Date(`${date}T12:00:00`));
}

export function signedByLabel(log: ShiftLog): string {
  return log.signOffs.length > 0
    ? log.signOffs.map((signOff) => signOff.actor).join(' and ')
    : 'Ready to begin';
}

/** Everything a person might type to find a log: date, day, shift, status, signers, note. */
function searchText(log: ShiftLog): string {
  return [
    log.id,
    log.operationalDate,
    formatOperationalDate(log.operationalDate),
    phaseLabels[log.phase],
    logStatusLabel(log),
    signedByLabel(log),
    log.note ?? '',
  ]
    .join(' ')
    .toLowerCase();
}

function matchesSearch(log: ShiftLog, query: string): boolean {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const text = searchText(log);
  return terms.every((term) => text.includes(term));
}

export interface FilteredDay {
  sheet: DailySheet;
  /** The rows of this sheet that match the search, in shift order. */
  matches: ShiftLog[];
}

/**
 * Daily Sheets keeping only days with at least one matching log. A date sort orders the days;
 * any other sort orders the rows inside each day, with days newest first.
 */
export function filterDays(
  logs: readonly ShiftLog[],
  query: string,
  sort: LogSort = defaultLogSort,
): FilteredDay[] {
  const days = groupDailySheets(logs)
    .map((sheet) => {
      const matches = sheet.logs.filter((log) => matchesSearch(log, query));
      return { sheet, matches: sort.key === 'date' ? matches : sortLogs(matches, sort) };
    })
    .filter((day) => day.matches.length > 0);
  return sort.key === 'date' && sort.direction === 'asc' ? days.reverse() : days;
}

export type LogSortKey = 'date' | 'shift' | 'status' | 'signedBy';
export type SortDirection = 'asc' | 'desc';

export interface LogSort {
  key: LogSortKey;
  direction: SortDirection;
}

export const defaultLogSort: LogSort = { key: 'date', direction: 'desc' };

const statusRank: Record<ShiftLog['status'], number> = {
  pending: 0,
  awaitingSecondSignOff: 1,
  signedOff: 2,
};

function compareBy(key: LogSortKey, left: ShiftLog, right: ShiftLog): number {
  switch (key) {
    case 'date':
      return left.operationalDate.localeCompare(right.operationalDate);
    case 'shift':
      return phaseOrder.indexOf(left.phase) - phaseOrder.indexOf(right.phase);
    case 'status':
      return statusRank[left.status] - statusRank[right.status];
    case 'signedBy':
      return signedByLabel(left).localeCompare(signedByLabel(right));
  }
}

/** Sort by the chosen column; ties fall back to newest date, then shift order. */
export function sortLogs(logs: readonly ShiftLog[], sort: LogSort): ShiftLog[] {
  const sign = sort.direction === 'asc' ? 1 : -1;
  return [...logs].sort(
    (left, right) =>
      sign * compareBy(sort.key, left, right) ||
      compareBy('date', right, left) ||
      compareBy('shift', left, right),
  );
}

/** Tapping the active column flips it; tapping another column starts it descending for dates. */
export function nextSort(current: LogSort, key: LogSortKey): LogSort {
  if (current.key === key) {
    return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
  }
  return { key, direction: key === 'date' ? 'desc' : 'asc' };
}
