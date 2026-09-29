import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
  FlatList,
  Pressable,
  type StyleProp,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';

import { Badge, Button, Card, Input, makeStyles, Text, useTheme } from '@/design-system';
import { Initials } from '@/features/common/Initials';
import { LoadingState, ScreenState } from '@/features/common/ScreenState';
import {
  selectLogsGroupByDay,
  selectLogsSort,
  selectLogsSearch,
  setLogsGroupByDay,
  setLogsSearch,
  setLogsSort,
} from '@/features/settings/uiSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { dailySheetStatus, dailySheetStatusLabels, logStatusLabel } from './dailySheet';
import {
  filterDays,
  formatOperationalDate,
  nextSort,
  signedByLabel,
  sortLogs,
  type FilteredDay,
  type LogSort,
  type LogSortKey,
} from './logFilters';
import { phaseIcons, phaseLabels } from './logTemplates';
import { useGetShiftLogsQuery } from './logsApi';
import { ShiftLogModal } from './ShiftLogModal';
import type { ShiftLog } from './types';

type ListItem = { kind: 'day'; day: FilteredDay } | { kind: 'row'; log: ShiftLog };

export function LogsScreen() {
  const styles = useStyles();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const search = useAppSelector(selectLogsSearch);
  const groupByDay = useAppSelector(selectLogsGroupByDay);
  const sort = useAppSelector(selectLogsSort);
  const { data, isError, isFetching, isLoading, refetch } = useGetShiftLogsQuery();
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const wide = width >= theme.breakpoint.wide;

  if (isLoading) {
    return (
      <View style={styles.screen} testID="screen-logs">
        <LoadingState label="Loading shift logs" />
      </View>
    );
  }

  if (isError && !data) {
    return (
      <View style={styles.screen} testID="screen-logs">
        <ScreenState
          title="Couldn't load shift logs"
          message="The log history could not be loaded. Try again."
          actionLabel="Retry"
          onAction={() => void refetch()}
          testID="logs-error"
        />
      </View>
    );
  }

  const days = filterDays(data ?? [], search, sort);
  const items: ListItem[] = groupByDay
    ? days.map((day) => ({ kind: 'day', day }))
    : sortLogs(
        days.flatMap((day) => day.matches),
        sort,
      ).map((log) => ({ kind: 'row', log }));
  const rowCount = days.reduce((total, day) => total + day.matches.length, 0);
  const hasLogs = (data ?? []).length > 0;

  return (
    <>
      <FlatList
        style={styles.screen}
        contentContainerStyle={styles.content}
        data={items}
        keyExtractor={(item) => (item.kind === 'day' ? item.day.sheet.date : item.log.id)}
        renderItem={({ item, index }) =>
          item.kind === 'day' ? (
            <DayGroup day={item.day} wide={wide} onOpen={setSelectedLogId} />
          ) : (
            <LogRow
              log={item.log}
              showDate
              wide={wide}
              last={index === items.length - 1}
              onOpen={setSelectedLogId}
            />
          )
        }
        ItemSeparatorComponent={groupByDay ? () => <View style={styles.separator} /> : null}
        ListHeaderComponent={
          <View style={styles.header}>
            <Input
              label="Search logs"
              value={search}
              onChangeText={(text) => dispatch(setLogsSearch(text))}
              placeholder="Date, shift, status, or name"
              autoCapitalize="none"
              autoCorrect={false}
              testID="logs-search"
            />
            <View style={styles.toolbar}>
              <Text variant="bodySm" tone="subtle" testID="logs-history-count">
                {groupByDay ? `${days.length} operational days` : `${rowCount} logs`}
              </Text>
              <View style={styles.viewToggle}>
                {groupByDay ? (
                  <DateSortButton
                    sort={sort}
                    onPress={() => dispatch(setLogsSort(nextSort(sort, 'date')))}
                  />
                ) : null}
                <Button
                  variant={groupByDay ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => dispatch(setLogsGroupByDay(true))}
                  accessibilityLabel="Group logs by day"
                  aria-pressed={groupByDay}
                  testID="logs-group-by-day"
                >
                  By day
                </Button>
                <Button
                  variant={groupByDay ? 'outline' : 'primary'}
                  size="sm"
                  onPress={() => dispatch(setLogsGroupByDay(false))}
                  accessibilityLabel="Show all logs in one table"
                  aria-pressed={!groupByDay}
                  testID="logs-show-all"
                >
                  All logs
                </Button>
              </View>
            </View>
            {isError ? (
              <Card testID="logs-stale">
                <Text variant="bodySm" weight="semibold">
                  Showing saved logs
                </Text>
                <Text variant="bodySm" tone="muted">
                  Refresh failed. Pull down to try again.
                </Text>
              </Card>
            ) : null}
            {items.length > 0 ? (
              <TableHeader
                wide={wide}
                showDate={!groupByDay}
                sort={sort}
                onSort={(key) => dispatch(setLogsSort(nextSort(sort, key)))}
              />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          hasLogs ? (
            <ScreenState
              title="No matching logs"
              message="Try a different date, shift, status, or name."
              actionLabel="Clear search"
              onAction={() => dispatch(setLogsSearch(''))}
              testID="logs-no-results"
            />
          ) : (
            <ScreenState
              title="No shift logs"
              message="Scheduled shift logs will appear here."
              testID="logs-empty"
            />
          )
        }
        refreshing={isFetching}
        onRefresh={() => void refetch()}
        testID="screen-logs"
      />
      <ShiftLogModal logId={selectedLogId} onClose={() => setSelectedLogId(null)} />
    </>
  );
}

function DayGroup({
  day,
  wide,
  onOpen,
}: {
  day: FilteredDay;
  wide: boolean;
  onOpen: (logId: string) => void;
}) {
  const styles = useStyles();
  const status = dailySheetStatus(day.sheet.logs);
  return (
    <View style={styles.table} testID={`log-day-${day.sheet.date}`}>
      <View style={styles.dayHeading}>
        <Text variant="bodySm" weight="semibold">
          {formatOperationalDate(day.sheet.date)}
        </Text>
        <Badge variant={status === 'complete' ? 'success' : 'warning'}>
          {`Daily Sheet · ${dailySheetStatusLabels[status]}`}
        </Badge>
      </View>
      {day.matches.map((log, index) => (
        <LogRow
          key={log.id}
          log={log}
          showDate={false}
          wide={wide}
          last={index === day.matches.length - 1}
          onOpen={onOpen}
        />
      ))}
    </View>
  );
}

/**
 * One header for both views. Tapping a column sorts by it; tapping it again reverses it.
 * By day, each card already names its date, so the date order moves to the toolbar.
 */
function TableHeader({
  wide,
  showDate,
  sort,
  onSort,
}: {
  wide: boolean;
  showDate: boolean;
  sort: LogSort;
  onSort: (key: LogSortKey) => void;
}) {
  const styles = useStyles();
  const cell = (key: LogSortKey, label: string, style: StyleProp<ViewStyle>) => (
    <HeaderCell sortKey={key} label={label} style={style} sort={sort} onSort={onSort} />
  );
  return (
    <View style={[styles.row, styles.headerRow]} accessibilityRole="header">
      {showDate ? cell('date', 'Date', styles.dateCell) : null}
      {cell('shift', 'Shift', styles.shiftCell)}
      {cell('status', 'Status', styles.statusCell)}
      {wide ? cell('signedBy', 'Signed by', styles.signedCell) : null}
    </View>
  );
}

function HeaderCell({
  sortKey,
  label,
  style,
  sort,
  onSort,
}: {
  sortKey: LogSortKey;
  label: string;
  style: StyleProp<ViewStyle>;
  sort: LogSort;
  onSort: (key: LogSortKey) => void;
}) {
  const styles = useStyles();
  const theme = useTheme();
  const active = sort.key === sortKey;
  const direction = sort.direction === 'asc' ? 'ascending' : 'descending';
  return (
    <Pressable
      onPress={() => onSort(sortKey)}
      accessibilityRole="button"
      accessibilityLabel={
        active ? `Sort by ${label}, ${direction}. Tap to reverse.` : `Sort by ${label}`
      }
      testID={`logs-sort-${sortKey}`}
      style={({ pressed }) => [style, styles.headerCell, pressed && styles.headerPressed]}
    >
      <Text variant="caption" tone={active ? 'default' : 'subtle'} weight="semibold">
        {label}
      </Text>
      {active ? (
        <Ionicons
          name={sort.direction === 'asc' ? 'chevron-up' : 'chevron-down'}
          size={theme.fontSize.xs}
          color={theme.color.text}
          testID={`logs-sort-${sortKey}-${sort.direction}`}
        />
      ) : null}
    </Pressable>
  );
}

/** By day, the date order lives in the toolbar: newest or oldest day first. */
function DateSortButton({ sort, onPress }: { sort: LogSort; onPress: () => void }) {
  const styles = useStyles();
  const theme = useTheme();
  const dateSorted = sort.key === 'date';
  const ascending = dateSorted && sort.direction === 'asc';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        ascending
          ? 'Oldest day first. Tap for newest first.'
          : 'Newest day first. Tap for oldest first.'
      }
      testID="logs-sort-date"
      style={({ pressed }) => [styles.sortButton, pressed && styles.headerPressed]}
    >
      <Text variant="bodySm" weight="medium">
        {ascending ? 'Oldest first' : 'Newest first'}
      </Text>
      {dateSorted ? (
        <Ionicons
          name={ascending ? 'chevron-up' : 'chevron-down'}
          size={theme.fontSize.xs}
          color={theme.color.text}
          testID={`logs-sort-date-${sort.direction}`}
        />
      ) : null}
    </Pressable>
  );
}

function LogRow({
  log,
  showDate,
  wide,
  last,
  onOpen,
}: {
  log: ShiftLog;
  showDate: boolean;
  wide: boolean;
  last: boolean;
  onOpen: (logId: string) => void;
}) {
  const styles = useStyles();
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => onOpen(log.id)}
      accessibilityRole="button"
      accessibilityLabel={`Open ${log.operationalDate} ${phaseLabels[log.phase]} log`}
      testID={`log-row-${log.id}`}
      style={({ pressed }) => [
        styles.row,
        styles.bodyRow,
        !showDate && last && styles.lastRow,
        pressed && styles.pressed,
      ]}
    >
      {showDate ? (
        <View style={styles.dateCell}>
          <Text variant="bodySm" weight="medium">
            {formatOperationalDate(log.operationalDate)}
          </Text>
        </View>
      ) : null}
      <View style={styles.shiftCell}>
        <View style={styles.shiftLabel}>
          <Ionicons
            name={phaseIcons[log.phase]}
            size={theme.fontSize.base}
            color={theme.color.textMuted}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          <Text variant="bodySm" weight="semibold">
            {phaseLabels[log.phase]}
          </Text>
        </View>
        {wide ? null : (
          // Narrow rows have no room for names: initials only, or a note while nobody has signed.
          <View style={styles.signers}>
            {log.signOffs.length > 0 ? (
              <Initials
                names={log.signOffs.map((signOff) => signOff.actor)}
                label={signedByLabel(log)}
                testID={`log-row-${log.id}-initials`}
              />
            ) : (
              <Text variant="caption" tone="muted">
                {signedByLabel(log)}
              </Text>
            )}
          </View>
        )}
      </View>
      <View style={styles.statusCell}>
        <Badge variant={log.status === 'signedOff' ? 'success' : 'warning'}>
          {logStatusLabel(log)}
        </Badge>
      </View>
      {wide ? (
        <View style={[styles.signedCell, styles.signers]}>
          <Initials
            names={log.signOffs.map((signOff) => signOff.actor)}
            testID={`log-row-${log.id}-initials`}
          />
          <Text variant="bodySm" tone="muted">
            {signedByLabel(log)}
          </Text>
        </View>
      ) : null}
    </Pressable>
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
  header: { gap: t.spacing[3], paddingBottom: t.spacing[3] },
  signers: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[2] },
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing[2],
  },
  viewToggle: { flexDirection: 'row', gap: t.spacing[2] },
  dayHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing[3],
    paddingHorizontal: t.spacing[3],
    paddingVertical: t.spacing[2],
    backgroundColor: t.color.bgSubtle,
    borderBottomWidth: 1,
    borderBottomColor: t.color.border,
  },
  sortButton: {
    minHeight: t.size.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[1],
    // No left padding: when the toolbar wraps on phones, the label lines up with the content edge.
    paddingRight: t.spacing[3],
    borderRadius: t.radius.md,
  },
  table: {
    borderWidth: 1,
    borderColor: t.color.border,
    borderRadius: t.radius.lg,
    overflow: 'hidden',
    backgroundColor: t.color.surface,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[3],
    paddingHorizontal: t.spacing[3],
  },
  headerRow: {
    backgroundColor: t.color.bgSubtle,
    borderBottomWidth: 1,
    borderBottomColor: t.color.border,
  },
  bodyRow: {
    minHeight: t.size.touchTarget,
    paddingVertical: t.spacing[2],
    backgroundColor: t.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: t.color.border,
  },
  lastRow: { borderBottomWidth: 0 },
  headerCell: {
    minHeight: t.size.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[1],
  },
  headerPressed: { opacity: t.opacity.pressed },
  pressed: { backgroundColor: t.color.bgSubtleHover },
  dateCell: { flex: 2 },
  shiftCell: { flex: 3, gap: t.spacing[1] },
  shiftLabel: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[2] },
  statusCell: { flex: 2, alignItems: 'flex-start' },
  signedCell: { flex: 3 },
  separator: { height: t.spacing[3] },
}));
