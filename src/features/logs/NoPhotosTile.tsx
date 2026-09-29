import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { makeStyles, Text, useTheme } from '@/design-system';

/** Stands in for a shift photo when a shift has none, at the same size as a photo tile. */
export function NoPhotosTile({ testID }: { testID?: string }) {
  const styles = useStyles();
  const theme = useTheme();
  return (
    <View
      style={styles.tile}
      accessible
      accessibilityLabel="No photos from this shift"
      {...(testID ? { testID } : {})}
    >
      <Ionicons name="images-outline" size={theme.fontSize['2xl']} color={theme.color.textSubtle} />
      <Text variant="caption" tone="subtle">
        No photos
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  tile: {
    width: t.spacing[16] + t.spacing[12],
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing[1],
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: t.color.borderStrong,
    backgroundColor: t.color.bgSubtle,
  },
}));
