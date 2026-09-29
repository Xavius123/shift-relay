import { Linking, View } from 'react-native';

import { Button, makeStyles, Text } from '@/design-system';
import type { DemoAccountId } from '@/features/auth/types';

import { canAddWalkPhotos } from './logPermissions';
import type { ShiftLog } from './types';
import { useAddPhotos } from './useAddPhotos';

/**
 * The sheet's camera: pinned to the bottom so a photo is one tap away wherever you are in the
 * form, such as at the sign-off button of a handoff. Photos land as drafts at the top of the
 * sheet, where they are reviewed and saved.
 */
export function SheetCameraBar({
  log,
  accountId,
  onAdded,
}: {
  log: ShiftLog;
  accountId: DemoAccountId | null;
  /** Called after photos are added, so the sheet can scroll to them. */
  onAdded: () => void;
}) {
  const styles = useStyles();
  const picker = useAddPhotos(log.id, onAdded);
  if (!canAddWalkPhotos(accountId, log)) return null;

  return (
    <View style={styles.bar} testID="sheet-camera-bar">
      {picker.error ? (
        <View style={styles.error} testID="sheet-camera-error">
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
        </View>
      ) : null}
      <View style={styles.actions}>
        <View style={styles.primary}>
          <Button
            onPress={() => void picker.takePhoto()}
            loading={picker.working === 'camera'}
            disabled={picker.busy}
            accessibilityLabel="Take a photo for this shift"
            testID="sheet-take-photo"
          >
            Take photo
          </Button>
        </View>
        <Button
          variant="secondary"
          onPress={() => void picker.choosePhotos()}
          loading={picker.working === 'library'}
          disabled={picker.busy}
          accessibilityLabel="Choose photos for this shift"
          testID="sheet-choose-photos"
        >
          Library
        </Button>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  bar: {
    gap: t.spacing[2],
    padding: t.spacing[3],
    borderTopWidth: 1,
    borderTopColor: t.color.border,
    backgroundColor: t.color.surface,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[2] },
  primary: { flex: 1 },
  error: { gap: t.spacing[2] },
}));
