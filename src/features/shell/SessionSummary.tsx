import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, makeStyles, Text } from '@/design-system';
import { demoAccounts } from '@/features/auth/demoAccounts';
import { selectDemoAccountId, signOut } from '@/features/auth/sessionSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

/** Who is signed in, shown once under the app name in the nav instead of on every screen. */
export function SessionSummary({ testIDPrefix = 'shell' }: { testIDPrefix?: string }) {
  const styles = useStyles();
  const dispatch = useAppDispatch();
  const accountId = useAppSelector(selectDemoAccountId);
  const account = accountId ? demoAccounts[accountId] : null;

  return (
    <View style={styles.root} testID={`${testIDPrefix}-session`}>
      <View style={styles.copy}>
        <Text variant="bodySm" weight="semibold" numberOfLines={1}>
          {account ? account.name : 'Not signed in'}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {account ? account.title : 'Choose a demo user'}
        </Text>
      </View>
      <Button
        variant="ghost"
        size="sm"
        onPress={() => {
          if (account) dispatch(signOut());
          router.navigate('/sign-in');
        }}
        accessibilityLabel={account ? 'Sign out of demo session' : 'Go to sign in'}
        testID={`${testIDPrefix}-${account ? 'sign-out' : 'sign-in'}`}
      >
        {account ? 'Sign out' : 'Sign in'}
      </Button>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[2],
    padding: t.spacing[2],
    borderRadius: t.radius.md,
    backgroundColor: t.color.bgSubtle,
  },
  copy: { flex: 1, gap: t.spacing[1] },
}));
