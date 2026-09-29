import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { AccessibilityInfo, Image, Linking, Pressable, View } from 'react-native';

import { Button, Card, makeStyles, Text, useTheme } from '@/design-system';
import { demoActor } from '@/features/auth/demoAccounts';
import type { DemoAccountId } from '@/features/auth/sessionSlice';
import { usePhotoPicker } from '@/features/camera/usePhotoPicker';
import { Initials } from '@/features/common/Initials';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { canDeleteWalkPhotos } from './logPermissions';
import { phaseLabels } from './logTemplates';
import { isLogsApiError, useAddWalkPhotosMutation, useRemoveWalkPhotoMutation } from './logsApi';
import { NoPhotosTile } from './NoPhotosTile';
import { PhotoPreview, type PreviewPhoto } from './PhotoPreview';
import type { ShiftLog, WalkPhoto } from './types';
import {
  addWalkDrafts,
  clearWalkDrafts,
  discardWalkDraft,
  selectWalkDrafts,
} from './walkDraftsSlice';

const time = new Intl.DateTimeFormat(undefined, { timeStyle: 'short' });

export function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

/**
 * The top of every shift sheet: shift photos. The Shift Manager on duty takes
 * photos, reviews them (removing any), and saves them to the log before closing the shift.
 * Saved photos are the record: everyone can view them; only the Operations Manager deletes them.
 */
export function WalkPhotos({
  log,
  accountId,
  canEdit,
}: {
  log: ShiftLog;
  accountId: DemoAccountId | null;
  canEdit: boolean;
}) {
  const styles = useStyles();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const storedDrafts = useAppSelector((state) => selectWalkDrafts(state, log.id));
  // Drafts belong to the Shift Manager on duty; anyone else sees only what was saved.
  const drafts = canEdit ? storedDrafts : [];
  const [savePhotos, saving] = useAddWalkPhotosMutation();
  const [removePhoto, removing] = useRemoveWalkPhotoMutation();
  const [preview, setPreview] = useState<{ set: 'drafts' | 'saved'; index: number } | null>(null);
  const picker = usePhotoPicker((uris) => {
    if (uris.length === 0) return;
    dispatch(addWalkDrafts(log.id, uris));
    AccessibilityInfo.announceForAccessibility(`${plural(uris.length, 'photo')} ready to review`);
  });

  const saved = log.walkPhotos;
  const canDelete = canDeleteWalkPhotos(accountId);
  const context = `${phaseLabels[log.phase]} shift · ${log.operationalDate}`;
  const actor = demoActor(accountId);
  const draftPreview: PreviewPhoto[] = drafts.map((draft) => ({
    photo: { id: draft.id, uri: draft.uri, caption: null, actor, at: draft.at },
    context: `${context} · not saved`,
  }));
  const savedPreview: PreviewPhoto[] = saved.map((photo) => ({ photo, context }));
  const busy = picker.busy || saving.isLoading;
  const apiError = saving.error ?? removing.error;

  const save = async () => {
    if (!accountId || drafts.length === 0) return;
    try {
      await savePhotos({ id: log.id, uris: drafts.map((draft) => draft.uri), accountId }).unwrap();
      dispatch(clearWalkDrafts(log.id));
      AccessibilityInfo.announceForAccessibility(`${plural(drafts.length, 'photo')} saved`);
    } catch {
      // The message renders below; the drafts stay for retry.
    }
  };

  const summary =
    saved.length === 0
      ? canEdit
        ? 'Take photos during your shift, review them, then save them to this log.'
        : 'No photos from this shift.'
      : `${plural(saved.length, 'photo')} saved to this log`;

  return (
    <View style={styles.section} testID="walk-photos">
      <View style={styles.copy}>
        <Text variant="title">Shift Photos</Text>
        <Text variant="caption" tone="muted" testID="walk-photos-count">
          {summary}
        </Text>
      </View>

      {canEdit ? (
        <View style={styles.actions}>
          <Button
            onPress={() => void picker.takePhoto()}
            disabled={busy}
            accessibilityLabel="Take a shift photo"
            testID="walk-take-photo"
          >
            Take photo
          </Button>
          <Button
            variant="secondary"
            onPress={() => void picker.choosePhotos()}
            disabled={busy}
            accessibilityLabel="Choose shift photos from library"
            testID="walk-choose-photos"
          >
            Choose from library
          </Button>
        </View>
      ) : null}

      {picker.error ? (
        <Card testID="walk-photos-error">
          <Text variant="bodySm" tone="error" weight="semibold">
            {picker.error.message}
          </Text>
          {picker.error.openSettings ? (
            <Button
              variant="outline"
              size="sm"
              onPress={() => void Linking.openSettings()}
              accessibilityLabel="Open Settings"
            >
              Open Settings
            </Button>
          ) : null}
        </Card>
      ) : null}

      {drafts.length > 0 ? (
        <Card testID="walk-drafts">
          <Text variant="bodySm" weight="semibold" testID="walk-drafts-count">
            {`Review ${plural(drafts.length, 'photo')}`}
          </Text>
          <Text variant="caption" tone="muted">
            Tap to check each one and remove any you don&apos;t want, then save. Once saved, only
            the Operations Manager can delete them.
          </Text>
          <View style={styles.grid}>
            {drafts.map((draft, index) => (
              <View key={draft.id} style={styles.tile} testID="walk-draft">
                <Pressable
                  onPress={() => setPreview({ set: 'drafts', index })}
                  accessibilityRole="button"
                  accessibilityLabel={`Review unsaved photo ${index + 1}`}
                  testID="walk-draft-open"
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <Image source={{ uri: draft.uri }} style={styles.image} resizeMode="cover" />
                </Pressable>
                <Pressable
                  onPress={() => dispatch(discardWalkDraft({ logId: log.id, draftId: draft.id }))}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove unsaved photo ${index + 1}`}
                  testID="walk-draft-remove"
                  style={({ pressed }) => [styles.remove, pressed && styles.pressed]}
                >
                  <View style={styles.removeDot}>
                    <Ionicons name="close" size={theme.fontSize.base} color={theme.color.text} />
                  </View>
                </Pressable>
              </View>
            ))}
          </View>
          <Button
            onPress={() => void save()}
            loading={saving.isLoading}
            disabled={busy}
            accessibilityLabel={`Save ${plural(drafts.length, 'photo')} to this log`}
            testID="walk-save-photos"
          >
            {`Save ${plural(drafts.length, 'photo')}`}
          </Button>
        </Card>
      ) : null}

      {apiError ? (
        <Text variant="bodySm" tone="error" weight="semibold" testID="walk-photos-save-error">
          {isLogsApiError(apiError)
            ? apiError.data.message
            : "The photos couldn't be saved. Try again."}
        </Text>
      ) : null}

      <View style={styles.grid}>
        {saved.length === 0 && drafts.length === 0 ? (
          <NoPhotosTile testID="walk-no-photos" />
        ) : (
          saved.map((photo, index) => (
            <SavedTile
              key={photo.id}
              photo={photo}
              index={index}
              onOpen={() => setPreview({ set: 'saved', index })}
            />
          ))
        )}
      </View>

      <PhotoPreview
        photos={preview?.set === 'drafts' ? draftPreview : savedPreview}
        index={preview?.index ?? null}
        onChange={(index) => setPreview((current) => (current ? { ...current, index } : null))}
        onClose={() => setPreview(null)}
        {...(preview?.set === 'saved' && canDelete && accountId
          ? {
              deleting: removing.isLoading,
              onDelete: (item: PreviewPhoto) => {
                setPreview(null);
                void removePhoto({ id: log.id, photoId: item.photo.id, accountId });
              },
            }
          : {})}
      />
    </View>
  );
}

function SavedTile({
  photo,
  index,
  onOpen,
}: {
  photo: WalkPhoto;
  index: number;
  onOpen: () => void;
}) {
  const styles = useStyles();
  return (
    <View style={styles.tile} testID="walk-photo">
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`View ${photo.caption ?? `shift photo ${index + 1}`}, by ${photo.actor}`}
        testID="walk-photo-open"
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Image source={{ uri: photo.uri }} style={styles.image} resizeMode="cover" />
      </Pressable>
      <View style={styles.meta}>
        <Initials names={[photo.actor]} />
        <Text variant="caption" tone="muted">
          {time.format(new Date(photo.at))}
        </Text>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  section: { gap: t.spacing[3] },
  copy: { gap: t.spacing[1] },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing[2] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing[3] },
  tile: { width: t.spacing[16] + t.spacing[12], gap: t.spacing[1] },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: t.radius.md,
    backgroundColor: t.color.bgSubtle,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[1] },
  // A full touch target in the corner; the visible dot is smaller.
  remove: {
    position: 'absolute',
    top: t.spacing[0],
    right: t.spacing[0],
    width: t.size.touchTarget,
    height: t.size.touchTarget,
    alignItems: 'flex-end',
    padding: t.spacing[1],
  },
  removeDot: {
    width: t.spacing[6],
    height: t.spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radius.full,
    backgroundColor: t.color.surface,
    boxShadow: t.shadow.sm,
  },
  pressed: { opacity: t.opacity.pressed },
}));
