import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Linking, Modal, Pressable, View } from 'react-native';

import { Button, Card, makeStyles, Text, useTheme } from '@/design-system';
import { selectDemoAccountId } from '@/features/auth/sessionSlice';
import { usePhotoPicker } from '@/features/camera/usePhotoPicker';
import { currentPhotoLog } from '@/features/logs/logPermissions';
import { localDateKey, phaseLabels } from '@/features/logs/logTemplates';
import { useGetShiftLogsQuery } from '@/features/logs/logsApi';
import { ShiftLogModal } from '@/features/logs/ShiftLogModal';
import { addWalkDrafts } from '@/features/logs/walkDraftsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

/**
 * The center bottom-tab button: a direct camera. It opens the camera for the Shift Manager's
 * current form that is not closed (day shift: Morning, then Midday; night shift: Midday, then
 * Night), then opens that form with the photo waiting to be reviewed and saved.
 * It is never a dead button: with no open form it says why and points to Shift Photos.
 */
export function ShiftCaptureButton() {
  const styles = useStyles();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const accountId = useAppSelector(selectDemoAccountId);
  const { data, isLoading } = useGetShiftLogsQuery();
  const [openLogId, setOpenLogId] = useState<string | null>(null);
  const [noticeOpen, setNoticeOpen] = useState(false);

  const today = localDateKey(new Date());
  const current = currentPhotoLog(
    accountId,
    (data ?? []).filter((log) => log.operationalDate === today),
  );
  const picker = usePhotoPicker((uris) => {
    if (!current || uris.length === 0) return;
    dispatch(addWalkDrafts(current.id, uris));
    setOpenLogId(current.id);
  });
  const busy = isLoading || picker.working === 'camera';
  const showNotice = noticeOpen || picker.error !== null;
  const closeNotice = () => {
    setNoticeOpen(false);
    picker.clearError();
  };

  const press = () => {
    if (current === null) setNoticeOpen(true);
    else void picker.takePhoto();
  };

  return (
    <View style={styles.slot}>
      <Pressable
        onPress={press}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel={
          isLoading
            ? 'Loading shift forms'
            : current === null
              ? 'Camera: no open shift form'
              : `Take a photo for ${phaseLabels[current.phase]}`
        }
        aria-busy={busy}
        testID="nav-camera"
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        {busy ? (
          <ActivityIndicator color={theme.color.accentFg} />
        ) : (
          <Ionicons name="camera" size={theme.fontSize['2xl']} color={theme.color.accentFg} />
        )}
      </Pressable>

      <ShiftLogModal logId={openLogId} onClose={() => setOpenLogId(null)} />

      <Modal visible={showNotice} transparent animationType="fade" onRequestClose={closeNotice}>
        <View style={styles.scrim}>
          <Card testID="camera-notice">
            <Text variant="title">
              {picker.error ? "Can't open the camera" : 'No open shift form'}
            </Text>
            <Text tone="muted">
              {picker.error
                ? picker.error.message
                : accountId === 'elena'
                  ? 'Shift Managers add photos to their own forms. You can review saved photos on Shift Photos.'
                  : "Today's forms for your shift are all closed. Saved photos are on Shift Photos."}
            </Text>
            {picker.error?.openSettings ? (
              <Button
                variant="outline"
                onPress={() => void Linking.openSettings()}
                accessibilityLabel="Open Settings"
              >
                Open Settings
              </Button>
            ) : null}
            <Button
              onPress={() => {
                closeNotice();
                router.navigate('/photos');
              }}
              accessibilityLabel="Go to Shift Photos"
              testID="camera-notice-photos"
            >
              Shift Photos
            </Button>
            <Button
              variant="ghost"
              onPress={closeNotice}
              accessibilityLabel="Close"
              testID="camera-notice-close"
            >
              Close
            </Button>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  slot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  button: {
    width: t.size.control.lg,
    height: t.size.control.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.color.accent,
    borderRadius: t.radius.full,
    boxShadow: t.shadow.md,
  },
  pressed: { opacity: t.opacity.pressed },
  scrim: {
    flex: 1,
    justifyContent: 'center',
    padding: t.spacing[4],
    backgroundColor: t.color.overlay,
  },
}));
