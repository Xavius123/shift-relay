import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ScrollView, useWindowDimensions, View } from 'react-native';

import { Button, Card, makeStyles, Text, useTheme, type IconName } from '@/design-system';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { demoAccounts } from './demoAccounts';
import { selectDemoAccountId, signIn } from './sessionSlice';
import type { DemoAccountId } from './types';

const accountOrder: readonly DemoAccountId[] = ['jordan', 'avery', 'elena'];

const accountIcons: Record<DemoAccountId, IconName> = {
  jordan: 'sunny-outline',
  avery: 'moon-outline',
  elena: 'briefcase-outline',
};

const landingRoutes: Record<DemoAccountId, '/'> = {
  jordan: '/',
  avery: '/',
  elena: '/',
};

/**
 * Demo account picker. Choosing an account signs in and lands on the Dashboard.
 */
export function SignInScreen() {
  const styles = useStyles();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const accountId = useAppSelector(selectDemoAccountId);
  const wide = width >= theme.breakpoint.wide;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      testID="screen-sign-in"
    >
      <Text tone="muted">Select a demo user to sign in.</Text>

      <View style={wide ? styles.accountsRow : styles.accountsColumn}>
        {accountOrder.map((id) => (
          <DemoAccountCard
            key={id}
            accountId={id}
            selected={accountId === id}
            fillRow={wide}
            onSelect={() => {
              dispatch(signIn(id));
              router.replace(landingRoutes[id]);
            }}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function DemoAccountCard({
  accountId,
  selected,
  fillRow,
  onSelect,
}: {
  accountId: DemoAccountId;
  selected: boolean;
  fillRow: boolean;
  onSelect: () => void;
}) {
  const styles = useStyles();
  const theme = useTheme();
  const account = demoAccounts[accountId];

  return (
    <View style={fillRow ? styles.cardSlot : undefined}>
      <Card testID={`demo-account-${accountId}`}>
        <View style={styles.cardHeading}>
          <View style={styles.copy}>
            <Text variant="title">{account.name}</Text>
            <Text variant="bodySm" tone="muted">
              {account.title}
            </Text>
          </View>
          <View
            style={styles.roleIcon}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Ionicons
              name={accountIcons[accountId]}
              size={theme.fontSize.xl}
              color={theme.color.accent}
            />
          </View>
        </View>
        <Button
          variant={selected ? 'outline' : 'primary'}
          size="sm"
          onPress={onSelect}
          disabled={selected}
          accessibilityLabel={
            selected ? `${account.name} demo account active` : `Sign in as ${account.name}`
          }
          testID={`demo-sign-in-${accountId}`}
        >
          {selected ? 'Active' : 'Sign in'}
        </Button>
      </Card>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  screen: { flex: 1, backgroundColor: t.color.bg },
  content: {
    width: '100%',
    maxWidth: t.size.content,
    alignSelf: 'center',
    gap: t.spacing[6],
    padding: t.spacing[4],
    paddingBottom: t.spacing[16],
  },
  accountsRow: { flexDirection: 'row', gap: t.spacing[3] },
  accountsColumn: { gap: t.spacing[3] },
  cardSlot: { flex: 1 },
  cardHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: t.spacing[2],
  },
  copy: { flex: 1, gap: t.spacing[1] },
  roleIcon: {
    width: t.size.touchTarget,
    height: t.size.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radius.full,
    backgroundColor: t.color.infoBg,
  },
}));
