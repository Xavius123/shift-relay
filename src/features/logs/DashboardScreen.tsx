import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Badge, Button, Card, makeStyles, Text } from '@/design-system';
import { Initials } from '@/features/common/Initials';
import { demoAccounts, visiblePhases } from '@/features/auth/demoAccounts';
import { selectDemoAccountId } from '@/features/auth/sessionSlice';
import { LoadingState, ScreenState } from '@/features/common/ScreenState';
import { ManagerOpenIssues, ManagerWeekMetrics } from '@/features/manager/ManagerWeekSummary';
import { useAppSelector } from '@/store/hooks';

import {
  dailySheetStatus,
  dailySheetStatusLabels,
  logStatusLabel,
  nextActionFor,
  sheetStage,
} from './dailySheet';
import { localDateKey, phaseDescriptions, phaseOrder } from './logTemplates';
import { issueTitle } from '@/features/issues/issueCategories';

import { useGetIssuesQuery, useGetShiftLogsQuery } from './logsApi';
import { ShiftLogModal } from './ShiftLogModal';
import type { ShiftLog } from './types';

const todayLabel = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

const rowLabels = {
  morning: 'Morning',
  midday: 'Midday handoff',
  night: 'Night',
} as const satisfies Record<ShiftLog['phase'], string>;

export function DashboardScreen() {
  const styles = useStyles();
  const accountId = useAppSelector(selectDemoAccountId);
  const logsQuery = useGetShiftLogsQuery();
  const issuesQuery = useGetIssuesQuery();
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const logs = logsQuery.data ?? [];
  const today = localDateKey(new Date());
  const todayLogs = phaseOrder
    .map((phase) => logs.find((log) => log.operationalDate === today && log.phase === phase))
    .filter((log): log is ShiftLog => log !== undefined);
  const openIssues = (issuesQuery.data ?? [])
    .filter((item) => item.status === 'open')
    .sort((left, right) => right.raisedAt.localeCompare(left.raisedAt));
  const retry = () => {
    void logsQuery.refetch();
    void issuesQuery.refetch();
  };

  if (logsQuery.isLoading || issuesQuery.isLoading) {
    return (
      <View style={styles.screen} testID="screen-dashboard">
        <LoadingState label="Loading shift dashboard" />
      </View>
    );
  }

  if ((logsQuery.isError || issuesQuery.isError) && logs.length === 0) {
    return (
      <View style={styles.screen} testID="screen-dashboard">
        <ScreenState
          title="Couldn't load the shift dashboard"
          message="The daily logs could not be loaded. Try again."
          actionLabel="Retry"
          onAction={retry}
          testID="dashboard-error"
        />
      </View>
    );
  }

  const status = dailySheetStatus(todayLogs);
  const nextAction = nextActionFor(accountId, todayLogs);
  const manager = accountId !== null && demoAccounts[accountId].role === 'manager';
  const observer = accountId === null || manager;

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        testID="screen-dashboard"
      >
        <View style={styles.header}>
          <Text variant="title" testID="dashboard-date">
            {todayLabel.format(new Date(`${today}T12:00:00`))}
          </Text>

          {logsQuery.isError || issuesQuery.isError ? (
            <Card testID="dashboard-stale">
              <Text variant="bodySm" weight="semibold">
                Showing saved logs
              </Text>
              <Text variant="bodySm" tone="muted">
                Refresh failed. The sheet below may be out of date.
              </Text>
              <Button variant="outline" onPress={retry} accessibilityLabel="Retry refresh">
                Retry
              </Button>
            </Card>
          ) : null}

          {manager ? <ManagerWeekMetrics logs={logs} issues={issuesQuery.data ?? []} /> : null}

          <Card testID="daily-sheet">
            <View style={styles.cardHeading}>
              <Text variant="title">Daily Sheet</Text>
              <Badge
                variant={status === 'complete' ? 'success' : 'warning'}
                testID="daily-sheet-status"
              >
                {dailySheetStatusLabels[status]}
              </Badge>
            </View>
            <View style={styles.phaseGrid} testID="today-shifts">
              {todayLogs
                .filter((log) => visiblePhases(accountId).includes(log.phase))
                .map((log) => (
                  <SheetRow key={log.id} log={log} onOpen={() => setSelectedLogId(log.id)} />
                ))}
            </View>
            <View style={styles.nextAction} testID="next-action">
              {nextAction.kind === 'form' ? (
                <Button
                  onPress={() => setSelectedLogId(nextAction.logId)}
                  accessibilityLabel={nextAction.label}
                  testID="next-action-button"
                >
                  {nextAction.label}
                </Button>
              ) : (
                <Text variant="bodySm" weight="semibold" testID="next-action-status">
                  {nextAction.label}
                </Text>
              )}
              {observer ? (
                <Text variant="caption" tone="muted">
                  {`Read-only view · ${sheetStage(todayLogs)}`}
                </Text>
              ) : null}
            </View>
          </Card>

          {manager ? (
            <>
              <Button
                variant="outline"
                onPress={() =>
                  router.navigate({ pathname: '/report/[date]', params: { date: today } })
                }
                accessibilityLabel="Open today's manager report"
                testID="manager-daily-report"
              >
                Today&apos;s report
              </Button>
              <ManagerOpenIssues
                logs={logs}
                issues={issuesQuery.data ?? []}
                onOpenLog={setSelectedLogId}
              />
            </>
          ) : (
            <Card testID="dashboard-issues">
              <View style={styles.cardHeading}>
                <Text variant="title">High-priority issues</Text>
                <Badge variant={openIssues.length > 0 ? 'error' : 'success'}>
                  {openIssues.length > 0 ? `${openIssues.length} open` : 'Clear'}
                </Badge>
              </View>
              {openIssues.slice(0, 3).map((issue) => (
                <Text key={issue.id} variant="bodySm" numberOfLines={1}>
                  {`• ${issueTitle(issue)}`}
                </Text>
              ))}
              {openIssues.length === 0 ? (
                <Text variant="bodySm" tone="muted">
                  Nothing flagged is waiting.
                </Text>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                onPress={() => router.navigate('/issues')}
                accessibilityLabel="View all issues"
                testID="dashboard-view-issues"
              >
                View issues
              </Button>
            </Card>
          )}
        </View>
      </ScrollView>
      <ShiftLogModal logId={selectedLogId} onClose={() => setSelectedLogId(null)} />
    </>
  );
}

function SheetRow({ log, onOpen }: { log: ShiftLog; onOpen: () => void }) {
  const styles = useStyles();
  const statusLabel = logStatusLabel(log);
  return (
    <Card
      variant="interactive"
      padding="sm"
      onPress={onOpen}
      accessibilityLabel={`Open ${rowLabels[log.phase]}, ${statusLabel}`}
      testID={`shift-card-${log.phase}`}
    >
      <View style={styles.cardHeading}>
        <Text variant="bodySm" weight="semibold">
          {rowLabels[log.phase]}
        </Text>
        <View style={styles.cardTrailing}>
          <Initials
            names={log.signOffs.map((signOff) => signOff.actor)}
            testID={`shift-card-${log.phase}-initials`}
          />
          <Badge variant={log.status === 'signedOff' ? 'success' : 'warning'}>{statusLabel}</Badge>
        </View>
      </View>
      <Text variant="caption" tone="muted">
        {phaseDescriptions[log.phase]}
      </Text>
    </Card>
  );
}

const useStyles = makeStyles((t) => ({
  screen: { flex: 1, backgroundColor: t.color.bg },
  content: {
    width: '100%',
    maxWidth: t.size.content,
    alignSelf: 'center',
    padding: t.spacing[4],
    paddingBottom: t.spacing[16],
  },
  header: { gap: t.spacing[4], paddingBottom: t.spacing[4] },
  phaseGrid: { gap: t.spacing[2] },
  cardTrailing: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[2] },
  nextAction: { gap: t.spacing[2], paddingTop: t.spacing[1] },
  cardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing[3],
  },
}));
