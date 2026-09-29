import { View } from 'react-native';

import { Button, makeStyles } from '@/design-system';
import { selectDemoAccountId, signOut } from '@/features/auth/sessionSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { ThemeToggle } from './ThemeToggle';

/** Top-right of every section header: the theme toggle, then Sign out while signed in. */
export function HeaderActions() {
  const styles = useStyles();
  const dispatch = useAppDispatch();
  const accountId = useAppSelector(selectDemoAccountId);

  return (
    <View style={styles.root}>
      <ThemeToggle />
      {accountId ? (
        <Button
          variant="ghost"
          size="sm"
          onPress={() => dispatch(signOut())}
          accessibilityLabel="Sign out of demo session"
          testID="header-sign-out"
        >
          Sign out
        </Button>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[1] },
}));
