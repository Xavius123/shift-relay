import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Image, useWindowDimensions, View } from 'react-native';

import { Badge, Button, Card, makeStyles, Text, useTheme } from '@/design-system';
import { Initials } from '@/features/common/Initials';
import { usePhotoPicker } from '@/features/camera/usePhotoPicker';
import { phaseLabels } from '@/features/logs/logTemplates';
import type { ShiftLog } from '@/features/logs/types';

import { issueCategories, issueTitle } from './issueCategories';
import type { Issue } from './types';

const dateTime = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

interface ResolveAction {
  onResolve: (photoUris: string[]) => Promise<void>;
  loading: boolean;
}

/**
 * One issue, the same everywhere it appears. Pass `resolve` only when the viewer may resolve it,
 * and `onOpenSource` where opening the source log makes sense.
 */
export function IssueRow({
  issue,
  sourceLog,
  onOpenSource,
  resolve,
}: {
  issue: Issue;
  sourceLog?: ShiftLog | undefined;
  onOpenSource?: (logId: string) => void;
  resolve?: ResolveAction;
}) {
  const styles = useStyles();
  const theme = useTheme();
  const compact = useWindowDimensions().width < theme.breakpoint.wide;
  const [resolving, setResolving] = useState(false);
  const [resolutionPhotos, setResolutionPhotos] = useState<string[]>([]);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const picker = usePhotoPicker((uris) =>
    setResolutionPhotos((current) => [...current, ...uris].slice(0, 5)),
  );
  const category = issueCategories[issue.category];
  const open = issue.status === 'open';
  const title = issueTitle(issue);
  // Phones show who raised it and who resolved it; photo events stay in the full trail.
  const trailEvents = compact
    ? issue.events.filter((event) => event.type !== 'photoAdded')
    : issue.events;
  const source = sourceLog
    ? `${phaseLabels[sourceLog.phase]} · ${sourceLog.operationalDate}`
    : 'Raised from Issues';

  return (
    <Card testID={`issue-${issue.id}`}>
      <View style={styles.heading}>
        {compact ? null : (
          <View
            style={[styles.icon, open ? styles.iconOpen : styles.iconResolved]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Ionicons
              name={category.icon}
              size={theme.fontSize.lg}
              color={open ? theme.color.error : theme.color.success}
            />
          </View>
        )}
        <View style={styles.copy}>
          <Text variant="bodySm" weight="semibold">
            {title}
          </Text>
          {issue.category !== 'other' && issue.details ? (
            <Text variant="bodySm" tone="muted" {...(compact ? { numberOfLines: 2 } : {})}>
              {issue.details}
            </Text>
          ) : null}
          <Text variant="caption" tone="subtle">
            {issue.category === 'other' ? `${category.label} · ${source}` : source}
          </Text>
        </View>
        <Badge variant={open ? 'error' : 'success'}>{open ? 'Open' : 'Resolved'}</Badge>
      </View>

      <View style={styles.trail} testID={`issue-trail-${issue.id}`}>
        {trailEvents.map((event) => (
          <View key={`${event.type}-${event.at}`} style={styles.eventRow}>
            <Initials names={[event.actor]} />
            <Text variant="caption" tone="muted">
              {`${event.type === 'raised' ? 'Raised' : event.type === 'resolved' ? 'Resolved' : 'Photo added'} by ${event.actor} · ${dateTime.format(new Date(event.at))}`}
            </Text>
          </View>
        ))}
      </View>

      {issue.photos.length > 0 ? (
        <View style={styles.photos} accessibilityLabel={`${issue.photos.length} issue photos`}>
          {issue.photos.map((photo) => (
            <Image
              key={photo.id}
              source={{ uri: photo.uri }}
              style={[styles.photo, compact && styles.photoCompact]}
              accessibilityLabel={`${photo.purpose} photo`}
            />
          ))}
        </View>
      ) : null}

      {(sourceLog && onOpenSource) || (open && resolve) ? (
        <View style={styles.actions}>
          {sourceLog && onOpenSource ? (
            <Button
              variant="ghost"
              size="sm"
              onPress={() => onOpenSource(sourceLog.id)}
              accessibilityLabel={`View source log for ${title}, ${source}`}
              testID={`open-source-${issue.id}`}
            >
              View source log
            </Button>
          ) : null}
          {open && resolve ? (
            <Button
              variant="outline"
              size="sm"
              onPress={() => setResolving((current) => !current)}
              loading={resolve.loading}
              accessibilityLabel={`Resolve ${title}`}
              testID={`resolve-issue-${issue.id}`}
            >
              {resolving ? 'Cancel resolution' : 'Resolve'}
            </Button>
          ) : null}
        </View>
      ) : null}
      {open && resolve && resolving ? (
        <View style={styles.resolution}>
          <Text variant="bodySm" weight="semibold">
            Resolution photos (optional)
          </Text>
          <View style={styles.actions}>
            <Button
              variant="outline"
              size="sm"
              disabled={picker.busy || resolutionPhotos.length >= 5}
              onPress={() => void picker.takePhoto()}
              accessibilityLabel="Take a resolution photo"
            >
              Camera
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={picker.busy || resolutionPhotos.length >= 5}
              onPress={() => void picker.choosePhotos()}
              accessibilityLabel="Choose resolution photos"
            >
              Choose photos
            </Button>
          </View>
          {resolutionPhotos.map((uri, index) => (
            <View key={`${uri}-${index}`} style={styles.resolutionPhoto}>
              <Image
                source={{ uri }}
                style={styles.photo}
                accessibilityLabel={`Resolution draft photo ${index + 1}`}
              />
              <Button
                variant="ghost"
                size="sm"
                onPress={() =>
                  setResolutionPhotos((items) =>
                    items.filter((_, photoIndex) => photoIndex !== index),
                  )
                }
                accessibilityLabel={`Remove resolution photo ${index + 1}`}
              >
                Remove
              </Button>
            </View>
          ))}
          {picker.error ? (
            <Text variant="caption" tone="error">
              {picker.error.message}
            </Text>
          ) : null}
          {resolveError ? (
            <Text variant="bodySm" tone="error">
              {resolveError}
            </Text>
          ) : null}
          <Button
            loading={resolve.loading}
            onPress={() => {
              setResolveError(null);
              void resolve
                .onResolve(resolutionPhotos)
                .catch(() => setResolveError('Could not resolve this issue. Try again.'));
            }}
            accessibilityLabel={`Confirm resolution of ${title}`}
            testID={`confirm-resolve-${issue.id}`}
          >
            Confirm resolution
          </Button>
        </View>
      ) : null}
    </Card>
  );
}

const useStyles = makeStyles((t) => ({
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[2] },
  photos: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing[2] },
  photoCompact: { width: t.spacing[12], height: t.spacing[12] },
  resolution: { gap: t.spacing[2] },
  resolutionPhoto: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[2] },
  photo: {
    width: t.spacing[16],
    height: t.spacing[16],
    borderRadius: t.radius.sm,
    backgroundColor: t.color.bgSubtle,
  },
  heading: { flexDirection: 'row', alignItems: 'flex-start', gap: t.spacing[3] },
  icon: {
    width: t.size.touchTarget,
    height: t.size.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radius.full,
  },
  iconOpen: { backgroundColor: t.color.errorBg },
  iconResolved: { backgroundColor: t.color.successBg },
  copy: { flex: 1, gap: t.spacing[1] },
  trail: { gap: t.spacing[1] },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: t.spacing[2],
  },
}));
