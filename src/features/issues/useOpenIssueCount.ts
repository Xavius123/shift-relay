import { useGetIssuesQuery } from '@/features/logs/logsApi';

/** Open issues right now, for badges outside the Issues screen. */
export function useOpenIssueCount(): number {
  const { data } = useGetIssuesQuery();
  return data?.filter((issue) => issue.status === 'open').length ?? 0;
}
