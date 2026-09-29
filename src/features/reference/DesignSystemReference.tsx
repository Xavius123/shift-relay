import { ScrollView, View } from 'react-native';

import { Button, Card, makeStyles, Text } from '@/design-system';
import { selectSimulateFailure, setSimulateFailure } from '@/features/dev/devSlice';
import { logsApi } from '@/features/logs/logsApi';
import { ThemeControls } from '@/features/settings/ThemeControls';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { ComponentShowcase } from './ComponentShowcase';

// Review surface for the theme, the failure simulator, and every built component. It is made
// from the design system's own components.

export function DesignSystemReference() {
  const styles = useStyles();
  const dispatch = useAppDispatch();
  const simulateFailure = useAppSelector(selectSimulateFailure);

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.pageContent}
      testID="screen-design-system"
    >
      <View style={styles.column}>
        <View style={styles.section}>
          <Text variant="heading">Design system</Text>
          <Text tone="muted">
            One token source builds a typed React Native theme and a CSS file. Components read
            semantic tokens only, so light and dark work with no extra code.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="title">Theme</Text>
          <Text tone="muted">
            These controls write to Redux (uiSlice). The whole app re-themes, including the header
            and the dashboard.
          </Text>
          <ThemeControls />
        </View>

        <View style={styles.section}>
          <Text variant="title">Network simulation</Text>
          <Text tone="muted">
            Try the loading, error, retry, and draft recovery states on the operational screens.
          </Text>
          <Button
            variant="outline"
            onPress={() => {
              dispatch(setSimulateFailure(!simulateFailure));
              dispatch(logsApi.util.invalidateTags(['Log', 'Issue']));
            }}
            accessibilityLabel="Simulate network failure"
            testID="simulate-network-failure"
          >
            {simulateFailure ? 'Simulate network failure: On' : 'Simulate network failure: Off'}
          </Button>
        </View>

        <View style={styles.section}>
          <Text variant="title">Components</Text>
          <Text tone="muted">
            Every variant, size, and state from the specs in docs/specs/components/. Switch the
            theme above and they follow.
          </Text>
          <Card>
            <ComponentShowcase />
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}

const useStyles = makeStyles((t) => ({
  page: { flex: 1, backgroundColor: t.color.bg },
  pageContent: { padding: t.spacing[4], paddingBottom: t.spacing[16] },
  column: { width: '100%', maxWidth: t.size.content, alignSelf: 'center', gap: t.spacing[8] },
  section: { gap: t.spacing[3] },
}));
