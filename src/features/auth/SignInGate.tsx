import Ionicons from '@expo/vector-icons/Ionicons';
import { router, usePathname } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { makeStyles, Text, useTheme } from '@/design-system';
import { ThemeToggle } from '@/features/shell/ThemeToggle';

import { landingRoutes, SignInScreen } from './SignInScreen';

/**
 * Shown instead of the app while no demo account is signed in. A deep link (e.g. /logs)
 * stays where it was after sign-in; the root and /sign-in land on the role's home screen.
 */
export function SignInGate() {
  const styles = useStyles();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  return (
    <View style={styles.root} testID="sign-in-gate">
      <View style={[styles.bar, { paddingTop: insets.top + theme.spacing[3] }]}>
        <View
          style={styles.mark}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Ionicons name="swap-horizontal" size={theme.fontSize.xl} color={theme.color.accentFg} />
        </View>
        <View style={styles.title}>
          <Text variant="title">Sign in to Shift Relay</Text>
        </View>
        <ThemeToggle />
      </View>
      <SignInScreen
        onSignedIn={(id) => {
          if (pathname === '/' || pathname === '/sign-in') router.replace(landingRoutes[id]);
        }}
      />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { flex: 1, backgroundColor: t.color.bg },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[3],
    paddingHorizontal: t.spacing[4],
    paddingBottom: t.spacing[3],
    backgroundColor: t.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: t.color.border,
  },
  mark: {
    width: t.size.touchTarget,
    height: t.size.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.color.accent,
    borderRadius: t.radius.lg,
  },
  title: { flex: 1 },
}));
