import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  View,
} from 'react-native';

import { Button, Card, makeStyles, Text, useTheme } from '@/design-system';
import { selectDemoAccountId } from '@/features/auth/sessionSlice';
import { usePhotoPicker } from '@/features/camera/usePhotoPicker';
import { currentPhotoLog } from '@/features/logs/logPermissions';
import { phaseLabels } from '@/features/logs/logTemplates';
import { useAddWalkPhotosMutation } from '@/features/logs/logsApi';
import { ShiftLogModal } from '@/features/logs/ShiftLogModal';
import type { ShiftPhase } from '@/features/logs/types';
import { useTodayLogs } from '@/features/logs/useTodayLogs';
import { useAppSelector } from '@/store/hooks';

/**
 * The center bottom-tab button: a direct camera. It opens the camera for the Shift Manager's
 * current form that is not closed (day shift: Morning, then Midday; night shift: Midday, then
 * Night) and saves the photo straight to that shift, staying on the current screen with a
 * short confirmation. The camera's own Use Photo / Retake is the review step.
 * It is never a dead button: with no open form it says why and points to Shift Photos.
 */
export function ShiftCaptureButton() {
  const styles = useStyles();
  const theme = useTheme();
  const accountId = useAppSelector(selectDemoAccountId);
  const { todayLogs, query } = useTodayLogs();
  const isLoading = query.isLoading;
  const [openLogId, setOpenLogId] = useState<string | null>(null);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [saved, setSaved] = useState<{ logId: string; phase: ShiftPhase; count: number } | null>(
    null,
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savePhotos, saving] = useAddWalkPhotosMutation();

  const current = currentPhotoLog(accountId, todayLogs);
  const picker = usePhotoPicker((photos) => {
    if (current === null || accountId === null || photos.length === 0) return;
    savePhotos({ id: current.id, photos, accountId })
      .unwrap()
      .then(() => {
        setSaved({ logId: current.id, phase: current.phase, count: photos.length });
        AccessibilityInfo.announceForAccessibility(
          `${photos.length === 1 ? 'Photo' : 'Photos'} saved to ${phaseLabels[current.phase]}`,
        );
      })
      .catch(() => setSaveError("The photo wasn't saved. Try again."));
  });
  const busy = isLoading || picker.working === 'camera' || saving.isLoading;
  const showNotice = noticeOpen || picker.error !== null || saveError !== null || saved !== null;
  const closeNotice = () => {
    setNoticeOpen(false);
    setSaved(null);
    setSaveError(null);
    picker.clearError();
  };
  const problem = picker.error?.message ?? saveError;

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
              : `${picker.canUseCamera ? 'Take' : 'Upload'} a photo for ${phaseLabels[current.phase]}`
        }
        aria-busy={busy}
        testID="nav-camera"
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        {busy ? (
          <ActivityIndicator color={theme.color.accentFg} />
        ) : (
          <Ionicons
            name={picker.canUseCamera ? 'camera' : 'cloud-upload'}
            size={theme.fontSize['2xl']}
            color={theme.color.accentFg}
          />
        )}
      </Pressable>

      <ShiftLogModal logId={openLogId} onClose={() => setOpenLogId(null)} />

      <Modal visible={showNotice} transparent animationType="fade" onRequestClose={closeNotice}>
        <View style={styles.scrim}>
          <Card testID="camera-notice">
            <Text variant="title">
              {saved
                ? 'Photo saved'
                : picker.error
                  ? "Can't open the camera"
                  : saveError
                    ? "Couldn't save the photo"
                    : 'No open shift form'}
            </Text>
            <Text tone="muted">
              {saved
                ? `${saved.count === 1 ? 'Saved' : `${saved.count} photos saved`} to the ${phaseLabels[saved.phase]} shift.`
                : problem
                  ? problem
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
            {saved ? (
              <>
                <Button
                  onPress={() => {
                    closeNotice();
                    void picker.takePhoto();
                  }}
                  accessibilityLabel={
                    picker.canUseCamera ? 'Take another photo' : 'Upload another photo'
                  }
                  testID="camera-notice-again"
                >
                  {picker.canUseCamera ? 'Take another photo' : 'Upload another photo'}
                </Button>
                <Button
                  variant="outline"
                  onPress={() => {
                    setOpenLogId(saved.logId);
                    closeNotice();
                  }}
                  accessibilityLabel="Open the shift"
                  testID="camera-notice-open"
                >
                  Open shift
                </Button>
              </>
            ) : (
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
            )}
            <Button
              variant="ghost"
              onPress={closeNotice}
              accessibilityLabel={saved ? 'Done' : 'Close'}
              testID="camera-notice-close"
            >
              {saved ? 'Done' : 'Close'}
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
