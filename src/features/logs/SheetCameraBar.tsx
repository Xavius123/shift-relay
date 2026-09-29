import { AccessibilityInfo, View } from 'react-native';

import { Button, makeStyles } from '@/design-system';
import type { DemoAccountId } from '@/features/auth/sessionSlice';
import { usePhotoPicker } from '@/features/camera/usePhotoPicker';
import { useAppDispatch } from '@/store/hooks';

import { canAddWalkPhotos } from './logPermissions';
import type { ShiftLog } from './types';
import { plural } from './WalkPhotos';
import { addWalkDrafts } from './walkDraftsSlice';

/**
 * Pinned to the bottom of a shift sheet so a photo is one tap away wherever you are in the form,
 * such as at the sign-off button of a handoff. Photos land as drafts at the top of the sheet.
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
  const dispatch = useAppDispatch();
  const picker = usePhotoPicker((uris) => {
    if (uris.length === 0) return;
    dispatch(addWalkDrafts(log.id, uris));
    AccessibilityInfo.announceForAccessibility(`${plural(uris.length, 'photo')} ready to review`);
    onAdded();
  });
  if (!canAddWalkPhotos(accountId, log)) return null;

  return (
    <View style={styles.bar} testID="sheet-camera-bar">
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
  );
}

const useStyles = makeStyles((t) => ({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[2],
    padding: t.spacing[3],
    borderTopWidth: 1,
    borderTopColor: t.color.border,
    backgroundColor: t.color.surface,
  },
  primary: { flex: 1 },
}));
