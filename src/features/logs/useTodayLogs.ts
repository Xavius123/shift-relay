import { useGetShiftLogsQuery } from './logsApi';
import { localDateKey, phaseOrder } from './logTemplates';
import type { ShiftLog } from './types';

/**
 * Today's logs in day order (Morning, Midday, Night), plus the underlying query for its
 * loading and error state. Derived on each render; never copied into a slice.
 */
export function useTodayLogs() {
  const query = useGetShiftLogsQuery();
  const today = localDateKey(new Date());
  const todayLogs = phaseOrder
    .map((phase) =>
      (query.data ?? []).find((log) => log.operationalDate === today && log.phase === phase),
    )
    .filter((log): log is ShiftLog => log !== undefined);
  return { todayLogs, today, query };
}
