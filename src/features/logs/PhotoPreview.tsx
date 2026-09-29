import { useState } from 'react';
import { Image, Modal, Pressable, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Button, makeStyles, Text } from '@/design-system';
import { formatDateTime } from '@/features/common/formatDateTime';
import { Initials } from '@/features/common/Initials';

import type { PreviewPhoto } from './types';

/**
 * One shift photo at full size, with who took it and when; Previous and Next step through the set.
 * Pass `onDelete` only for an account allowed to delete saved photos; it asks once to confirm.
 */
export function PhotoPreview({
  photos,
  index,
  onChange,
  onClose,
  onDelete,
  deleting = false,
}: {
  photos: readonly PreviewPhoto[];
  index: number | null;
  onChange: (index: number) => void;
  onClose: () => void;
  onDelete?: (photo: PreviewPhoto) => void;
  deleting?: boolean;
}) {
  const styles = useStyles();
  const current = index === null ? undefined : photos[index];
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const confirming = current !== undefined && confirmingId === current.photo.id;

  return (
    <Modal
      visible={current !== undefined}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaProvider>
        <View style={styles.scrim}>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close photo"
            style={styles.backdrop}
          />
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            {current && index !== null ? (
              <View
                style={styles.surface}
                aria-modal
                accessibilityViewIsModal
                testID="photo-preview"
              >
                <View style={styles.header}>
                  <View style={styles.copy}>
                    <Text variant="title">{current.context}</Text>
                    {current.photo.caption ? (
                      <Text variant="bodySm" testID="photo-preview-caption">
                        {current.photo.caption}
                      </Text>
                    ) : null}
                    <Text variant="caption" tone="muted" testID="photo-preview-position">
                      {`Photo ${index + 1} of ${photos.length}`}
                    </Text>
                  </View>
                  <Button
                    variant="ghost"
                    onPress={onClose}
                    accessibilityLabel="Close photo"
                    testID="photo-preview-close"
                  >
                    Close
                  </Button>
                </View>
                <Image
                  source={{ uri: current.photo.uri }}
                  style={styles.image}
                  resizeMode="contain"
                  accessibilityLabel={`${current.photo.caption ?? 'Shift photo'}, by ${current.photo.actor}`}
                />
                <View style={styles.footer}>
                  <View style={styles.byline}>
                    <Initials names={[current.photo.actor]} size="md" />
                    <View style={styles.copy}>
                      <Text variant="bodySm" weight="semibold" testID="photo-preview-actor">
                        {current.photo.actor}
                      </Text>
                      <Text variant="caption" tone="muted">
                        {formatDateTime(current.photo.at)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.steps}>
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => onChange(index - 1)}
                      disabled={index === 0}
                      accessibilityLabel="Previous photo"
                      testID="photo-preview-previous"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => onChange(index + 1)}
                      disabled={index === photos.length - 1}
                      accessibilityLabel="Next photo"
                      testID="photo-preview-next"
                    >
                      Next
                    </Button>
                  </View>
                </View>
                {onDelete ? (
                  <View style={styles.danger} testID="photo-preview-delete-area">
                    {confirming ? (
                      <>
                        <Text variant="bodySm" weight="semibold">
                          Delete this photo from the log? This can&apos;t be undone.
                        </Text>
                        <View style={styles.steps}>
                          <Button
                            variant="outline"
                            size="sm"
                            onPress={() => setConfirmingId(null)}
                            accessibilityLabel="Keep photo"
                            testID="photo-preview-delete-cancel"
                          >
                            Keep
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            loading={deleting}
                            onPress={() => {
                              setConfirmingId(null);
                              onDelete(current);
                            }}
                            accessibilityLabel="Confirm delete photo"
                            testID="photo-preview-delete-confirm"
                          >
                            Delete
                          </Button>
                        </View>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => setConfirmingId(current.photo.id)}
                        accessibilityLabel="Delete photo"
                        testID="photo-preview-delete"
                      >
                        Delete photo
                      </Button>
                    )}
                  </View>
                ) : null}
              </View>
            ) : null}
          </SafeAreaView>
        </View>
      </SafeAreaProvider>
    </Modal>
  );
}

const useStyles = makeStyles((t) => ({
  scrim: { flex: 1, backgroundColor: t.color.overlay },
  backdrop: {
    position: 'absolute',
    top: t.spacing[0],
    right: t.spacing[0],
    bottom: t.spacing[0],
    left: t.spacing[0],
  },
  safeArea: {
    flex: 1,
    // Let taps outside the dialog fall through to the backdrop.
    pointerEvents: 'box-none',
    justifyContent: 'center',
    alignItems: 'center',
    padding: t.spacing[4],
  },
  surface: {
    width: '100%',
    maxWidth: t.size.content,
    maxHeight: '100%',
    flexShrink: 1,
    backgroundColor: t.color.surface,
    borderRadius: t.radius.lg,
    boxShadow: t.shadow.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.spacing[3],
    padding: t.spacing[4],
  },
  copy: { flex: 1, gap: t.spacing[1] },
  image: { width: '100%', aspectRatio: 4 / 3, flexShrink: 1, backgroundColor: t.color.bgSubtle },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing[3],
    padding: t.spacing[4],
  },
  byline: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[3], flexShrink: 1 },
  steps: { flexDirection: 'row', gap: t.spacing[2] },
  danger: {
    gap: t.spacing[2],
    paddingHorizontal: t.spacing[4],
    paddingBottom: t.spacing[4],
    alignItems: 'flex-start',
  },
}));
