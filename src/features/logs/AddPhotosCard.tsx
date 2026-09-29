import { View } from 'react-native';

import { Button, Card, makeStyles, Text } from '@/design-system';
import { selectDemoAccountId } from '@/features/auth/sessionSlice';
import { usePhotoPicker } from '@/features/camera/usePhotoPicker';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { currentPhotoLog } from './logPermissions';
import { localDateKey, phaseLabels } from './logTemplates';
import { useGetShiftLogsQuery } from './logsApi';
import { addWalkDrafts } from './walkDraftsSlice';

/**
 * A shortcut at the top of Shift Photos: take or choose photos for the form the signed-in
 * Shift Manager is working on, then open it to review and save them.
 */
export function AddPhotosCard({ onOpenLog }: { onOpenLog: (logId: string) => void }) {
  const styles = useStyles();
  const dispatch = useAppDispatch();
  const accountId = useAppSelector(selectDemoAccountId);
  const { data } = useGetShiftLogsQuery();
  const today = localDateKey(new Date());
  const target = currentPhotoLog(
    accountId,
    (data ?? []).filter((log) => log.operationalDate === today),
  );
  const picker = usePhotoPicker((uris) => {
    if (!target || uris.length === 0) return;
    dispatch(addWalkDrafts(target.id, uris));
    onOpenLog(target.id);
  });
  if (!target) return null;

  return (
    <Card testID="add-photos-card">
      <Text variant="title">{`Add photos to ${phaseLabels[target.phase]}`}</Text>
      <Text variant="caption" tone="muted">
        Take or choose photos, then review and save them on the shift sheet.
      </Text>
      <View style={styles.actions}>
        <Button
          onPress={() => void picker.takePhoto()}
          loading={picker.working === 'camera'}
          disabled={picker.busy}
          accessibilityLabel={`Take a photo for ${phaseLabels[target.phase]}`}
          testID="add-photos-take"
        >
          Take photo
        </Button>
        <Button
          variant="secondary"
          onPress={() => void picker.choosePhotos()}
          loading={picker.working === 'library'}
          disabled={picker.busy}
          accessibilityLabel={`Choose photos for ${phaseLabels[target.phase]}`}
          testID="add-photos-choose"
        >
          Choose from library
        </Button>
      </View>
      {picker.error ? (
        <Text variant="bodySm" tone="error">
          {picker.error.message}
        </Text>
      ) : null}
    </Card>
  );
}

const useStyles = makeStyles((t) => ({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing[2] },
}));
