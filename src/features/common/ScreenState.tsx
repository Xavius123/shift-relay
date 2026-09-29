import { ActivityIndicator, View } from 'react-native';

import { Button, makeStyles, Text, useTheme } from '@/design-system';

export function LoadingState({ label }: { label: string }) {
  const styles = useStyles();
  const theme = useTheme();
  return (
    <View style={styles.root} accessibilityLiveRegion="polite" testID="loading-state">
      <ActivityIndicator color={theme.color.accent} accessibilityLabel={label} />
    </View>
  );
}

interface ScreenStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

export function ScreenState({ title, message, actionLabel, onAction, testID }: ScreenStateProps) {
  const styles = useStyles();
  return (
    <View style={styles.root} accessibilityLiveRegion="polite" testID={testID}>
      <Text variant="title">{title}</Text>
      <Text tone="muted">{message}</Text>
      {actionLabel && onAction ? (
        <Button onPress={onAction} accessibilityLabel={actionLabel}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing[3],
    paddingHorizontal: t.spacing[4],
    paddingVertical: t.spacing[16],
  },
}));
