import { router } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, View } from 'react-native';

import { Badge, Button, Card, makeStyles, Text } from '@/design-system';
import { formatDayLong } from '@/features/common/formatDate';
import { plural } from '@/features/common/plural';
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
import { issueTitle } from '@/features/issues/issueCategories';

import { canAddWalkPhotos } from './logPermissions';
import { useGetIssuesQuery } from './logsApi';
import { ShiftLogModal } from './ShiftLogModal';
import { useTodayLogs } from './useTodayLogs';
import type { ShiftLog } from './types';
import { selectWalkDrafts } from './walkDraftsSlice';

const rowLabels = {
  morning: 'Morning',
  midday: 'Midday handoff',
  night: 'Night',
} as const satisfies Record<ShiftLog['phase'], string>;

export function DashboardScreen() {
  const styles = useStyles();
  const accountId = useAppSelector(selectDemoAccountId);
  const { todayLogs, today, query: logsQuery } = useTodayLogs();
  const issuesQuery = useGetIssuesQuery();
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const logs = logsQuery.data ?? [];
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
            {formatDayLong(today)}
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

const maxThumbnails = 4;

function SheetRow({ log, onOpen }: { log: ShiftLog; onOpen: () => void }) {
  const styles = useStyles();
  const accountId = useAppSelector(selectDemoAccountId);
  const storedDrafts = useAppSelector((state) => selectWalkDrafts(state, log.id));
  // Unsaved photos belong to the Shift Manager on duty; others see only what was saved.
  const drafts = canAddWalkPhotos(accountId, log) ? storedDrafts : [];
  const statusLabel = logStatusLabel(log);
  const thumbnails = [
    ...log.walkPhotos.map((photo) => ({ id: photo.id, uri: photo.uri, saved: true })),
    ...drafts.map((draft) => ({ id: draft.id, uri: draft.uri, saved: false })),
  ];
  const shown = thumbnails.slice(0, maxThumbnails);
  const hidden = thumbnails.length - shown.length;
  const photoNote = thumbnails.length > 0 ? `, ${plural(thumbnails.length, 'photo')}` : '';
  return (
    <Card
      variant="interactive"
      padding="sm"
      onPress={onOpen}
      accessibilityLabel={`Open ${rowLabels[log.phase]}, ${statusLabel}${photoNote}`}
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
      {shown.length > 0 ? (
        <View
          style={styles.thumbnails}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          testID={`shift-card-${log.phase}-photos`}
        >
          {shown.map((photo) => (
            <Image
              key={photo.id}
              source={{ uri: photo.uri }}
              style={[styles.thumbnail, !photo.saved && styles.thumbnailDraft]}
              resizeMode="cover"
              testID={photo.saved ? 'shift-card-photo' : 'shift-card-photo-draft'}
            />
          ))}
          {hidden > 0 ? (
            <Text variant="caption" tone="muted">
              {`+${hidden}`}
            </Text>
          ) : null}
        </View>
      ) : null}
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
  thumbnails: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[1] },
  thumbnail: {
    width: t.spacing[10],
    height: t.spacing[10],
    borderRadius: t.radius.sm,
    backgroundColor: t.color.bgSubtle,
  },
  // An unsaved photo: dashed, so it reads as not yet on the record.
  thumbnailDraft: { borderWidth: 1, borderStyle: 'dashed', borderColor: t.color.borderStrong },
  nextAction: { gap: t.spacing[2], paddingTop: t.spacing[1] },
  cardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing[3],
  },
}));
