import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { makeStyles, useTheme } from '@/design-system';
import { selectDemoAccountId } from '@/features/auth/sessionSlice';
import { currentPhotoLog } from '@/features/logs/logPermissions';
import { localDateKey, phaseLabels } from '@/features/logs/logTemplates';
import { useGetShiftLogsQuery } from '@/features/logs/logsApi';
import { ShiftLogModal } from '@/features/logs/ShiftLogModal';
import { useAppSelector } from '@/store/hooks';

/**
 * The center bottom-tab button. Opens the Shift Manager's current form that is not closed
 * (day shift: Morning, then Midday; night shift: Midday, then Night), with Shift Photos on top.
 * Disabled only when they have no open form left today, and for the Operations Manager.
 */
export function ShiftCaptureButton() {
  const styles = useStyles();
  const theme = useTheme();
  const accountId = useAppSelector(selectDemoAccountId);
  const { data } = useGetShiftLogsQuery();
  const [openLogId, setOpenLogId] = useState<string | null>(null);

  const today = localDateKey(new Date());
  const current = currentPhotoLog(
    accountId,
    (data ?? []).filter((log) => log.operationalDate === today),
  );
  const target = current?.id ?? null;

  return (
    <View style={styles.slot}>
      <Pressable
        onPress={() => setOpenLogId(target)}
        disabled={target === null}
        accessibilityRole="button"
        accessibilityLabel={
          current === null
            ? 'No open shift form to add photos to'
            : `Add photos to ${phaseLabels[current.phase]}`
        }
        aria-disabled={target === null}
        testID="nav-camera"
        style={({ pressed }) => [
          styles.button,
          target === null && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons name="camera" size={theme.fontSize['2xl']} color={theme.color.accentFg} />
      </Pressable>
      <ShiftLogModal logId={openLogId} onClose={() => setOpenLogId(null)} />
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
  disabled: { opacity: t.opacity.disabled },
  pressed: { opacity: t.opacity.pressed },
}));
