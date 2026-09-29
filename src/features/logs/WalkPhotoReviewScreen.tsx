import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { FlatList, Image, Pressable, View } from 'react-native';

import { Badge, Button, Card, makeStyles, Text, useTheme } from '@/design-system';
import { formatDay, formatDayFull } from '@/features/common/formatDate';
import { plural } from '@/features/common/plural';
import { Initials } from '@/features/common/Initials';
import { LoadingState, ScreenState } from '@/features/common/ScreenState';
import { selectDemoAccountId } from '@/features/auth/sessionSlice';
import { useAppSelector } from '@/store/hooks';

import { groupDailySheets, logStatusLabel, type DailySheet } from './dailySheet';
import { canDeleteWalkPhotos } from './logPermissions';
import { phaseIcons, phaseLabels, todayKey } from './logTemplates';
import { useGetShiftLogsQuery, useRemoveWalkPhotoMutation } from './logsApi';
import { NoPhotosTile } from './NoPhotosTile';
import { PhotoPreview } from './PhotoPreview';
import { ShiftLogModal } from './ShiftLogModal';
import type { PreviewPhoto, ShiftLog } from './types';

/**
 * Every account's view of saved shift photos: one card per day, newest first,
 * with Morning, Midday, and Night in order. Today always shows; older days only with photos.
 */
export function WalkPhotoReviewScreen() {
  const styles = useStyles();
  const logsQuery = useGetShiftLogsQuery();
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const accountId = useAppSelector(selectDemoAccountId);
  const [removePhoto, removing] = useRemoveWalkPhotoMutation();

  if (!logsQuery.data) {
    return (
      <View style={styles.screen} testID="screen-walk-photos">
        {logsQuery.isError ? (
          <ScreenState
            title="Couldn't load shift photos"
            message="The shift logs could not be loaded. Try again."
            actionLabel="Retry"
            onAction={() => void logsQuery.refetch()}
            testID="walk-review-error"
          />
        ) : (
          <LoadingState label="Loading shift photos" />
        )}
      </View>
    );
  }

  const today = todayKey();
  const days = groupDailySheets(logsQuery.data).filter(
    (day) => day.date === today || day.logs.some((log) => log.walkPhotos.length > 0),
  );
  // One list for Previous/Next, in the order the page shows them.
  const previewPhotos: (PreviewPhoto & { logId: string })[] = days.flatMap((day) =>
    day.logs.flatMap((log) =>
      log.walkPhotos.map((photo) => ({
        photo,
        logId: log.id,
        context: `${phaseLabels[log.phase]} shift · ${formatDay(day.date)}`,
      })),
    ),
  );
  const total = previewPhotos.length;
  const open = (photoId: string) =>
    setPreviewIndex(previewPhotos.findIndex((item) => item.photo.id === photoId));

  return (
    <>
      <FlatList
        style={styles.screen}
        contentContainerStyle={styles.content}
        data={days}
        keyExtractor={(day) => day.date}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <DayCard
            day={item}
            today={item.date === today}
            onOpenPhoto={open}
            onOpenLog={setSelectedLogId}
          />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text tone="muted">Shift photos by day. Tap a photo to see it full size.</Text>
            <Text variant="caption" tone="subtle" testID="walk-review-total">
              {total === 0
                ? 'No shift photos yet.'
                : `${plural(total, 'photo')} across ${plural(days.length, 'day')}`}
            </Text>
            {logsQuery.isError ? (
              <Card testID="walk-review-stale">
                <Text variant="bodySm" weight="semibold">
                  Showing saved photos
                </Text>
                <Text variant="bodySm" tone="muted">
                  Refresh failed. This page may be out of date.
                </Text>
              </Card>
            ) : null}
          </View>
        }
        refreshing={logsQuery.isFetching}
        onRefresh={() => void logsQuery.refetch()}
        testID="screen-walk-photos"
      />
      <PhotoPreview
        photos={previewPhotos}
        index={previewIndex !== null && previewIndex >= 0 ? previewIndex : null}
        onChange={setPreviewIndex}
        onClose={() => setPreviewIndex(null)}
        {...(canDeleteWalkPhotos(accountId) && accountId
          ? {
              deleting: removing.isLoading,
              onDelete: (item: PreviewPhoto) => {
                const logId = previewPhotos.find(
                  (entry) => entry.photo.id === item.photo.id,
                )?.logId;
                setPreviewIndex(null);
                if (logId) void removePhoto({ id: logId, photoId: item.photo.id, accountId });
              },
            }
          : {})}
      />
      <ShiftLogModal logId={selectedLogId} onClose={() => setSelectedLogId(null)} />
    </>
  );
}

function DayCard({
  day,
  today,
  onOpenPhoto,
  onOpenLog,
}: {
  day: DailySheet;
  today: boolean;
  onOpenPhoto: (photoId: string) => void;
  onOpenLog: (logId: string) => void;
}) {
  const styles = useStyles();
  return (
    <Card testID={`walk-review-day-${day.date}`}>
      <View style={styles.dayHeader}>
        <Text variant="title">{formatDay(day.date)}</Text>
        {today ? <Badge variant="accent">Today</Badge> : null}
      </View>
      {day.logs.map((log) => (
        <ShiftPhotos key={log.id} log={log} onOpenPhoto={onOpenPhoto} onOpenLog={onOpenLog} />
      ))}
    </Card>
  );
}

function ShiftPhotos({
  log,
  onOpenPhoto,
  onOpenLog,
}: {
  log: ShiftLog;
  onOpenPhoto: (photoId: string) => void;
  onOpenLog: (logId: string) => void;
}) {
  const styles = useStyles();
  const theme = useTheme();
  const count = log.walkPhotos.length;
  return (
    <View style={styles.shift} testID={`walk-review-shift-${log.id}`}>
      <View style={styles.shiftHeader}>
        <View style={styles.shiftTitle}>
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
          <Badge variant={log.status === 'signedOff' ? 'success' : 'warning'}>
            {logStatusLabel(log)}
          </Badge>
        </View>
        <Button
          variant="ghost"
          size="sm"
          onPress={() => onOpenLog(log.id)}
          accessibilityLabel={`Open ${phaseLabels[log.phase]} sheet for ${formatDayFull(log.operationalDate)}`}
          testID={`walk-review-open-log-${log.id}`}
        >
          Open sheet
        </Button>
      </View>
      {count === 0 ? (
        <NoPhotosTile testID="walk-review-no-photos" />
      ) : (
        <View style={styles.grid}>
          {log.walkPhotos.map((photo, index) => (
            <Pressable
              key={photo.id}
              onPress={() => onOpenPhoto(photo.id)}
              accessibilityRole="button"
              accessibilityLabel={`View ${phaseLabels[log.phase]} shift photo ${index + 1}${photo.caption ? `, ${photo.caption}` : ''}, by ${photo.actor}${photo.source === 'upload' ? ', uploaded' : ''}`}
              testID="walk-review-photo"
              style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
            >
              <Image source={{ uri: photo.uri }} style={styles.image} resizeMode="cover" />
              <Initials names={[photo.actor]} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
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
  header: { gap: t.spacing[2], paddingBottom: t.spacing[4] },
  separator: { height: t.spacing[3] },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[2] },
  shift: {
    gap: t.spacing[2],
    paddingTop: t.spacing[3],
    borderTopWidth: 1,
    borderTopColor: t.color.border,
  },
  shiftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing[2],
  },
  shiftTitle: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[2], flexShrink: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing[3] },
  tile: { width: t.spacing[16] + t.spacing[12], gap: t.spacing[1] },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: t.radius.md,
    backgroundColor: t.color.bgSubtle,
  },
  pressed: { opacity: t.opacity.pressed },
}));
