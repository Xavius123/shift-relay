import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Linking,
  Modal,
  Platform,
  Pressable,
  View,
} from 'react-native';

import { Button, Card, makeStyles, Text, useTheme } from '@/design-system';
import { selectDemoAccountId } from '@/features/auth/sessionSlice';
import { usePhotoPicker } from '@/features/camera/usePhotoPicker';
import { CloseButton } from '@/features/common/CloseButton';
import { photoLogs } from '@/features/logs/logPermissions';
import { phaseLabels } from '@/features/logs/logTemplates';
import { useAddWalkPhotosMutation } from '@/features/logs/logsApi';
import { ShiftLogModal } from '@/features/logs/ShiftLogModal';
import type { ShiftLog, ShiftPhase } from '@/features/logs/types';
import { useTodayLogs } from '@/features/logs/useTodayLogs';
import { useAppSelector } from '@/store/hooks';

/**
 * The center bottom-tab button: a direct camera. It always asks which of today's open forms the
 * photo is for, then opens the camera and saves the photo straight to that form, staying on the
 * current screen with a short confirmation. A Shift Manager is offered their own shift's forms
 * (day shift: Morning and Midday; night shift: Midday and Night); the Operations Manager is
 * offered all of the day's open forms. The camera's own Use Photo / Retake is the review step.
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
  const [choosing, setChoosing] = useState(false);
  const [saved, setSaved] = useState<{ logId: string; phase: ShiftPhase; count: number } | null>(
    null,
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savePhotos, saving] = useAddWalkPhotosMutation();
  // The form the next photo is for. A ref, because the picker's callback runs after the tap
  // that chose it, and must not see the previous render's choice.
  const target = useRef<ShiftLog | null>(null);
  // iOS cannot present the camera while a modal is still closing, so the launch waits for it.
  const launchAfterClose = useRef(false);

  const forms = photoLogs(accountId, todayLogs);
  const picker = usePhotoPicker((photos) => {
    const log = target.current;
    if (log === null || accountId === null || photos.length === 0) return;
    savePhotos({ id: log.id, photos, accountId })
      .unwrap()
      .then(() => {
        setSaved({ logId: log.id, phase: log.phase, count: photos.length });
        AccessibilityInfo.announceForAccessibility(
          `${photos.length === 1 ? 'Photo' : 'Photos'} saved to ${phaseLabels[log.phase]}`,
        );
      })
      .catch(() => setSaveError("The photo wasn't saved. Try again."));
  });
  const verb = picker.canUseCamera ? 'Take' : 'Upload';
  const busy = isLoading || picker.working === 'camera' || saving.isLoading;
  const showNotice = noticeOpen || picker.error !== null || saveError !== null || saved !== null;
  const closeNotice = () => {
    setNoticeOpen(false);
    setSaved(null);
    setSaveError(null);
    picker.clearError();
  };
  const problem = picker.error?.message ?? saveError;

  const capture = () => {
    if (Platform.OS === 'ios' && (choosing || showNotice)) launchAfterClose.current = true;
    else void picker.takePhoto();
  };
  const flushLaunch = () => {
    if (!launchAfterClose.current) return;
    launchAfterClose.current = false;
    void picker.takePhoto();
  };
  const takeFor = (log: ShiftLog) => {
    target.current = log;
    setChoosing(false);
    capture();
  };

  const press = () => {
    if (forms.length === 0) setNoticeOpen(true);
    else setChoosing(true);
  };

  const tabLabel = isLoading
    ? 'Loading shift forms'
    : forms.length === 0
      ? 'Camera: no open shift form'
      : `${verb} a photo: choose a shift`;

  return (
    <View style={styles.slot}>
      <Pressable
        onPress={press}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel={tabLabel}
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

      <Modal
        visible={choosing}
        transparent
        animationType="fade"
        onRequestClose={() => setChoosing(false)}
        onDismiss={flushLaunch}
      >
        <View style={styles.scrim}>
          <Card testID="camera-choose">
            <Text variant="title">Which shift is this photo for?</Text>
            <Text tone="muted">
              {`The photo is saved to the shift you pick. ${picker.canUseCamera ? 'The camera opens next.' : 'A file picker opens next.'}`}
            </Text>
            {forms.map((log) => (
              <Button
                key={log.id}
                variant="outline"
                onPress={() => takeFor(log)}
                accessibilityLabel={`${verb} a photo for the ${phaseLabels[log.phase]} shift`}
                testID={`camera-choose-${log.phase}`}
              >
                {`${phaseLabels[log.phase]} shift`}
              </Button>
            ))}
            <Button
              variant="ghost"
              onPress={() => setChoosing(false)}
              accessibilityLabel="Cancel"
              testID="camera-choose-cancel"
            >
              Cancel
            </Button>
          </Card>
        </View>
      </Modal>

      <Modal
        visible={showNotice}
        transparent
        animationType="fade"
        onRequestClose={closeNotice}
        onDismiss={flushLaunch}
      >
        <View style={styles.scrim}>
          <Card testID="camera-notice">
            <View style={styles.noticeHeader}>
              <View style={styles.noticeTitle}>
                <Text variant="title">
                  {saved
                    ? 'Photo saved'
                    : picker.error
                      ? "Can't open the camera"
                      : saveError
                        ? "Couldn't save the photo"
                        : 'No open shift form'}
                </Text>
              </View>
              <CloseButton
                onPress={closeNotice}
                accessibilityLabel="Close"
                testID="camera-notice-close"
              />
            </View>
            <Text tone="muted">
              {saved
                ? `${saved.count === 1 ? 'Saved' : `${saved.count} photos saved`} to the ${phaseLabels[saved.phase]} shift.`
                : problem
                  ? problem
                  : "Today's forms are all closed, so there is nothing to add photos to. Saved photos are on Shift Photos."}
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
                    capture();
                  }}
                  accessibilityLabel={`${verb} another photo for the ${phaseLabels[saved.phase]} shift`}
                  testID="camera-notice-again"
                >
                  {`${verb} another photo`}
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
  noticeHeader: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[3] },
  noticeTitle: { flex: 1 },
  scrim: {
    flex: 1,
    justifyContent: 'center',
    padding: t.spacing[4],
    backgroundColor: t.color.overlay,
  },
}));
