const dateTime = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

/** "Sep 29, 2026, 9:05 AM" in the device's locale, from an ISO timestamp. */
export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}
