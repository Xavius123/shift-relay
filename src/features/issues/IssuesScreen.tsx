import { useState } from 'react';
import { FlatList, View } from 'react-native';

import { Button, Card, makeStyles, Text } from '@/design-system';
import { selectDemoAccountId } from '@/features/auth/sessionSlice';
import type { PickedPhoto } from '@/features/camera/types';
import { LoadingState, ScreenState } from '@/features/common/ScreenState';
import {
  useGetIssuesQuery,
  useGetShiftLogsQuery,
  useResolveIssueMutation,
} from '@/features/logs/logsApi';
import { ShiftLogModal } from '@/features/logs/ShiftLogModal';
import {
  selectIssuesFilter,
  setIssuesFilter,
  type IssuesFilter,
} from '@/features/settings/uiSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { canManageIssues } from './issuePermissions';
import { IssueRow } from './IssueRow';
import { RaiseIssueForm } from './RaiseIssueForm';

const filterLabels = {
  open: 'Open',
  resolved: 'Resolved',
  all: 'All',
} as const satisfies Record<IssuesFilter, string>;

/** Every high-priority issue in one place: flag, resolve, or observe. */
export function IssuesScreen() {
  const styles = useStyles();
  const dispatch = useAppDispatch();
  const accountId = useAppSelector(selectDemoAccountId);
  const filter = useAppSelector(selectIssuesFilter);
  const issuesQuery = useGetIssuesQuery();
  const logsQuery = useGetShiftLogsQuery();
  const [resolveIssue, resolution] = useResolveIssueMutation();
  const [raising, setRaising] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const canManage = canManageIssues(accountId);

  if (issuesQuery.isLoading) {
    return (
      <View style={styles.screen} testID="screen-issues">
        <LoadingState label="Loading issues" />
      </View>
    );
  }

  if (issuesQuery.isError && !issuesQuery.data) {
    return (
      <View style={styles.screen} testID="screen-issues">
        <ScreenState
          title="Couldn't load issues"
          message="The issue list could not be loaded. Try again."
          actionLabel="Retry"
          onAction={() => void issuesQuery.refetch()}
          testID="issues-error"
        />
      </View>
    );
  }

  const issues = [...(issuesQuery.data ?? [])].sort((left, right) =>
    right.raisedAt.localeCompare(left.raisedAt),
  );
  const counts = {
    open: issues.filter((issue) => issue.status === 'open').length,
    resolved: issues.filter((issue) => issue.status === 'resolved').length,
    all: issues.length,
  } as const satisfies Record<IssuesFilter, number>;
  const shown = filter === 'all' ? issues : issues.filter((issue) => issue.status === filter);
  const logs = logsQuery.data ?? [];

  return (
    <>
      <FlatList
        style={styles.screen}
        contentContainerStyle={styles.content}
        data={shown}
        keyExtractor={(issue) => issue.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <IssueRow
            issue={item}
            sourceLog={logs.find((log) => log.id === item.sourceLogId)}
            onOpenSource={setSelectedLogId}
            {...(canManage && accountId
              ? {
                  resolve: {
                    loading: resolution.isLoading && resolution.originalArgs?.id === item.id,
                    onResolve: async (photos: PickedPhoto[]) => {
                      await resolveIssue({ id: item.id, accountId, photos }).unwrap();
                    },
                  },
                }
              : {})}
          />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.copy}>
                <Text tone="muted">High-priority issues across every shift.</Text>
              </View>
              {canManage && !raising ? (
                <Button
                  onPress={() => setRaising(true)}
                  accessibilityLabel="Flag a high-priority issue"
                  testID="flag-issue"
                >
                  Flag issue
                </Button>
              ) : null}
            </View>

            {!canManage ? (
              <Text variant="bodySm" tone="subtle" testID="issues-observer">
                Observing. Shift Managers flag and resolve issues.
              </Text>
            ) : null}

            {raising && accountId ? (
              <RaiseIssueForm
                accountId={accountId}
                sourceLogId={null}
                onDone={() => setRaising(false)}
              />
            ) : null}

            {issuesQuery.isError ? (
              <Card testID="issues-stale">
                <Text variant="bodySm" weight="semibold">
                  Showing saved issues
                </Text>
                <Text variant="bodySm" tone="muted">
                  Refresh failed. This list may be out of date.
                </Text>
              </Card>
            ) : null}
            {resolution.isError ? (
              <Text variant="bodySm" tone="error" weight="semibold" testID="resolve-issue-error">
                {"Couldn't resolve the issue. Try again."}
              </Text>
            ) : null}

            <View style={styles.filters}>
              {(Object.keys(filterLabels) as IssuesFilter[]).map((key) => (
                <Button
                  key={key}
                  variant={filter === key ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => dispatch(setIssuesFilter(key))}
                  accessibilityLabel={`Show ${filterLabels[key].toLowerCase()} issues`}
                  aria-pressed={filter === key}
                  testID={`issues-filter-${key}`}
                >
                  {`${filterLabels[key]} · ${counts[key]}`}
                </Button>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <ScreenState
            title={filter === 'open' ? 'No open issues' : 'No issues here'}
            message={
              filter === 'open'
                ? 'Everything flagged has been resolved.'
                : 'Flagged issues will appear here.'
            }
            testID="issues-empty"
          />
        }
        refreshing={issuesQuery.isFetching}
        onRefresh={() => void issuesQuery.refetch()}
        testID="screen-issues"
      />
      <ShiftLogModal logId={selectedLogId} onClose={() => setSelectedLogId(null)} />
    </>
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
  header: { gap: t.spacing[3], paddingBottom: t.spacing[4] },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: t.spacing[3],
  },
  copy: { flex: 1, gap: t.spacing[1] },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing[2] },
  separator: { height: t.spacing[3] },
}));
