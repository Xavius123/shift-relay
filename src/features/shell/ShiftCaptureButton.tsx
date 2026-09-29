import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { makeStyles, useTheme } from '@/design-system';
import { selectDemoAccountId } from '@/features/auth/sessionSlice';
import { nextActionFor } from '@/features/logs/dailySheet';
import { localDateKey, phaseOrder } from '@/features/logs/logTemplates';
import { useGetShiftLogsQuery } from '@/features/logs/logsApi';
import { ShiftLogModal } from '@/features/logs/ShiftLogModal';
import type { ShiftLog } from '@/features/logs/types';
import { useAppSelector } from '@/store/hooks';

/**
 * The center bottom-tab button. Opens the shift sheet the signed-in account has to fill in
 * next, where Shift Photos sit at the top. Disabled when nothing is waiting on them.
 */
export function ShiftCaptureButton() {
  const styles = useStyles();
  const theme = useTheme();
  const accountId = useAppSelector(selectDemoAccountId);
  const { data } = useGetShiftLogsQuery();
  const [openLogId, setOpenLogId] = useState<string | null>(null);

  const today = localDateKey(new Date());
  const todayLogs = phaseOrder
    .map((phase) =>
      (data ?? []).find((log) => log.operationalDate === today && log.phase === phase),
    )
    .filter((log): log is ShiftLog => log !== undefined);
  const next = nextActionFor(accountId, todayLogs);
  const target = next.kind === 'form' ? next.logId : null;

  return (
    <View style={styles.slot}>
      <Pressable
        onPress={() => setOpenLogId(target)}
        disabled={target === null}
        accessibilityRole="button"
        accessibilityLabel={
          target === null ? 'No shift is waiting for you' : `${next.label}: open the shift sheet`
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
