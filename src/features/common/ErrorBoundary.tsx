import { Component, type ErrorInfo, type ReactNode } from 'react';
import { View } from 'react-native';

import { Button, Card, makeStyles, Text } from '@/design-system';

interface Props {
  children: ReactNode;
}
interface State {
  failed: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('App error boundary caught an error', error, info.componentStack);
  }

  override render() {
    if (this.state.failed)
      return <ErrorFallback onRetry={() => this.setState({ failed: false })} />;
    return this.props.children;
  }
}

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const styles = useStyles();
  return (
    <View style={styles.screen}>
      <Card>
        <Text variant="title">Something went wrong</Text>
        <Text variant="bodySm" tone="muted">
          The app hit an unexpected error. Try again.
        </Text>
        <Button onPress={onRetry} accessibilityLabel="Try loading the app again">
          Try again
        </Button>
      </Card>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  screen: { flex: 1, justifyContent: 'center', padding: t.spacing[4] },
}));
