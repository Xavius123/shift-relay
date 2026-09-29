import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { Button, Card, makeStyles, Text } from '@/design-system';
import { demoAccounts } from '@/features/auth/demoAccounts';
import { selectDemoAccountId } from '@/features/auth/sessionSlice';
import { formatDateTime, formatDayFull } from '@/features/common/formatDate';
import { LoadingState, ScreenState } from '@/features/common/ScreenState';
import { IssueRow } from '@/features/issues/IssueRow';
import { useGetIssuesQuery, useGetShiftLogsQuery } from '@/features/logs/logsApi';
import { phaseDescriptions } from '@/features/logs/logTemplates';
import { useAppSelector } from '@/store/hooks';

export default function DailyReportRoute() {
  const styles = useStyles();
  const { date } = useLocalSearchParams<{ date: string }>();
  const accountId = useAppSelector(selectDemoAccountId);
  const logsQuery = useGetShiftLogsQuery();
  const issuesQuery = useGetIssuesQuery();
  if (accountId === null || demoAccounts[accountId].role !== 'manager')
    return (
      <View style={styles.page}>
        <ScreenState
          title="Manager access required"
          message="Daily reports are available to the Operations Manager."
          actionLabel="Back to Dashboard"
          onAction={() => router.replace('/')}
        />
      </View>
    );
  if (logsQuery.isLoading || issuesQuery.isLoading)
    return <LoadingState label="Loading daily report" />;
  if (logsQuery.isError || issuesQuery.isError)
    return (
      <ScreenState
        title="Couldn't load this report"
        message="The shift data could not be loaded."
        actionLabel="Retry"
        onAction={() => {
          void logsQuery.refetch();
          void issuesQuery.refetch();
        }}
      />
    );
  const logs = (logsQuery.data ?? []).filter((log) => log.operationalDate === date);
  if (logs.length === 0)
    return (
      <ScreenState
        title="Report not found"
        message="There are no shift logs for this date."
        actionLabel="Back to Dashboard"
        onAction={() => router.replace('/')}
      />
    );
  const issues = (issuesQuery.data ?? []).filter((issue) =>
    logs.some((log) => log.id === issue.sourceLogId),
  );
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text variant="heading">Daily Report · {formatDayFull(date)}</Text>
      {logs.map((log) => (
        <Card key={log.id}>
          <Text variant="title">{phaseDescriptions[log.phase]}</Text>
          <Text variant="bodySm">
            {log.status === 'signedOff'
              ? 'Signed off'
              : log.status === 'awaitingSecondSignOff'
                ? 'Awaiting second sign-off'
                : 'In progress'}
          </Text>
          {log.confirmations.map((check) => (
            <Text key={check.id} variant="bodySm">
              {check.confirmed ? '✓' : '○'} {check.label}
            </Text>
          ))}
          {log.checkEvents.map((event) => (
            <Text key={`${event.checkId}-${event.at}`} variant="caption" tone="muted">
              {event.actor} {event.checked ? 'confirmed' : 'reopened'} {event.label} ·{' '}
              {formatDateTime(event.at)}
            </Text>
          ))}
        </Card>
      ))}
      <Text variant="title">Issues and photos</Text>
      {issues.length ? (
        issues.map((issue) => (
          <IssueRow
            key={issue.id}
            issue={issue}
            sourceLog={logs.find((log) => log.id === issue.sourceLogId)}
          />
        ))
      ) : (
        <Text variant="bodySm" tone="muted">
          No issues were linked to this date.
        </Text>
      )}
      <Button
        variant="outline"
        onPress={() => router.back()}
        accessibilityLabel="Return to previous screen"
      >
        Back
      </Button>
    </ScrollView>
  );
}

const useStyles = makeStyles((t) => ({
  page: { flex: 1 },
  content: { gap: t.spacing[4], padding: t.spacing[4], paddingBottom: t.spacing[8] },
}));
