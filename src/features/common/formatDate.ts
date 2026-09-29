// The one place dates and times become text, so every screen reads the same. All use the
// device's locale.

const dayShort = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});
const dayFull = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});
const dayLong = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});
const dateMedium = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
const clock = new Intl.DateTimeFormat(undefined, { timeStyle: 'short' });

/** An operational date ("2026-09-29") as a local date, at noon so no timezone moves the day. */
function operationalDay(date: string): Date {
  return new Date(`${date}T12:00:00`);
}

/** "Tue, Sep 29": rows and headings inside a list that is already grouped by recent days. */
export function formatDay(date: string): string {
  return dayShort.format(operationalDay(date));
}

/** "Tue, Sep 29, 2026": a date shown on its own, out of context. */
export function formatDayFull(date: string): string {
  return dayFull.format(operationalDay(date));
}

/** "Tuesday, September 29": the greeting date on the Dashboard. */
export function formatDayLong(date: string): string {
  return dayLong.format(operationalDay(date));
}

/** "9:05 AM", from an ISO timestamp. */
export function formatTime(iso: string): string {
  return clock.format(new Date(iso));
}

/** "Sep 29, 2026 at 9:05 AM", from an ISO timestamp. */
export function formatDateTime(iso: string): string {
  const moment = new Date(iso);
  return `${dateMedium.format(moment)} at ${clock.format(moment)}`;
}
