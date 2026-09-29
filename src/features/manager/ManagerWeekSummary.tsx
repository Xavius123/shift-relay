import { useWindowDimensions, View } from 'react-native';

import { Badge, Card, makeStyles, Text, useTheme } from '@/design-system';
import type { Issue } from '@/features/issues/types';
import { IssueRow } from '@/features/issues/IssueRow';
import type { ShiftLog } from '@/features/logs/types';

import { computeOverview, percent } from './overviewAnalytics';

/** The Operations Manager's weekly numbers, at the top of the Dashboard. */
export function ManagerWeekMetrics({
  logs,
  issues,
}: {
  logs: readonly ShiftLog[];
  issues: readonly Issue[];
}) {
  const styles = useStyles();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const wide = width >= theme.breakpoint.wide;
  const { periods, openIssues } = computeOverview(logs, issues, new Date());
  const [current] = periods;
  // computeOverview always returns the three fixed periods, current first.
  if (!current) return null;

  return (
    <Card testID="manager-week">
      <View style={styles.titleRow}>
        <Text variant="title">This week</Text>
        <Text variant="caption" tone="subtle">
          {`${current.start} to ${current.end}`}
        </Text>
      </View>
      <View style={styles.metricGrid}>
        <Metric
          wide={wide}
          label="Handoffs complete"
          value={`${percent(current.complete, current.scheduled)}%`}
          detail={`${current.complete} of ${current.scheduled} forms`}
          testID="metric-complete"
        />
        <Metric
          wide={wide}
          label="Awaiting Night"
          value={String(current.awaitingApproval)}
          detail="Handoffs sent, not received"
          testID="metric-awaiting"
        />
        <Metric
          wide={wide}
          label="Issues raised"
          value={String(current.raised)}
          detail="This week"
          testID="metric-raised"
        />
        <Metric
          wide={wide}
          label="Issues open"
          value={String(openIssues.length)}
          detail="Now, any week"
          tone={openIssues.length > 0 ? 'error' : 'default'}
          testID="metric-open"
        />
      </View>
    </Card>
  );
}

/** Every open issue, each linking to the log it came from; below the Daily Sheet. */
export function ManagerOpenIssues({
  logs,
  issues,
  onOpenLog,
}: {
  logs: readonly ShiftLog[];
  issues: readonly Issue[];
  onOpenLog: (logId: string) => void;
}) {
  const styles = useStyles();
  const { openIssues } = computeOverview(logs, issues, new Date());
  return (
    <View style={styles.section} testID="manager-open-issues">
      <View style={styles.titleRow}>
        <Text variant="title">Open issues</Text>
        <Badge variant={openIssues.length > 0 ? 'error' : 'success'}>
          {openIssues.length > 0 ? `${openIssues.length} open` : 'Clear'}
        </Badge>
      </View>
      {openIssues.length === 0 ? (
        <Text tone="muted" testID="manager-no-open-issues">
          No issues are open.
        </Text>
      ) : (
        openIssues.map((item) => (
          <IssueRow
            key={item.id}
            issue={item}
            sourceLog={logs.find((log) => log.id === item.sourceLogId)}
            onOpenSource={onOpenLog}
          />
        ))
      )}
    </View>
  );
}

/** A stat box: two per row on phones, four across when wide. */
function Metric({
  wide,
  label,
  value,
  detail,
  tone = 'default',
  testID,
}: {
  wide: boolean;
  label: string;
  value: string;
  detail: string;
  tone?: 'default' | 'error';
  testID: string;
}) {
  const styles = useStyles();
  return (
    <View style={[styles.metric, wide ? styles.metricWide : styles.metricNarrow]} testID={testID}>
      <Text variant="heading" tone={tone}>
        {value}
      </Text>
      <Text variant="bodySm" weight="semibold">
        {label}
      </Text>
      <Text variant="caption" tone="subtle">
        {detail}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  section: { gap: t.spacing[3] },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing[3],
  },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing[3] },
  metric: {
    flexGrow: 1,
    gap: t.spacing[1],
    padding: t.spacing[4],
    backgroundColor: t.color.bgSubtle,
    borderRadius: t.radius.lg,
  },
  // Basis under a half or a quarter so the gap fits; flexGrow evens them out.
  metricNarrow: { flexBasis: '40%' },
  metricWide: { flexBasis: '20%' },
}));
