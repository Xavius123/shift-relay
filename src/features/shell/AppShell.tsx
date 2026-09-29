import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { TabList, TabSlot, Tabs, TabTrigger } from 'expo-router/ui';
import { useEffect, useState } from 'react';
import { Dimensions, Platform, Pressable, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { makeStyles, Text, useTheme } from '@/design-system';
import { selectDemoAccountId } from '@/features/auth/sessionSlice';
import { SignInGate } from '@/features/auth/SignInGate';
import { useOpenIssueCount } from '@/features/issues/useOpenIssueCount';
import { useAppSelector } from '@/store/hooks';

import { NavButton } from './NavButton';
import { bottomNavItems, navItems } from './navItems';
import { SessionSummary } from './SessionSummary';
import { ShiftCaptureButton } from './ShiftCaptureButton';
import { ShellMenuProvider } from './ShellMenu';

/**
 * The app frame. One set of tab routes, drawn two ways:
 * - wide (≥ breakpoint.wide): a side nav next to the content column
 * - narrow: the content, bottom tabs, and a hamburger-opened side drawer
 */
export function AppShell() {
  const styles = useStyles();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const accountId = useAppSelector(selectDemoAccountId);
  const wide = width >= theme.breakpoint.wide;
  const openIssues = useOpenIssueCount();
  const badgeFor = (name: string) => (name === 'issues' ? openIssues : 0);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      if (window.width >= theme.breakpoint.wide) setMenuOpen(false);
    });
    return () => subscription.remove();
  }, [theme.breakpoint.wide]);

  useEffect(() => {
    if (!menuOpen || Platform.OS !== 'web') return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  return (
    <>
      <ShellMenuProvider openMenu={() => setMenuOpen(true)}>
        <Tabs style={wide ? styles.rootWide : styles.root}>
          <TabList style={styles.routeDefinitions}>
            {navItems.map((item) => (
              <TabTrigger key={item.name} name={item.name} href={item.href} />
            ))}
          </TabList>

          {/* Sign-in is required: signed out, the tabs stay mounted but only the gate shows. */}
          {accountId === null ? <SignInGate /> : null}

          {accountId !== null && wide ? (
            <View
              style={[styles.side, { paddingTop: insets.top + theme.spacing[4] }]}
              testID="side-nav"
            >
              <View style={styles.brand}>
                <View
                  style={styles.brandMark}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                >
                  <Ionicons
                    name="swap-horizontal"
                    size={theme.fontSize['2xl']}
                    color={theme.color.accentFg}
                  />
                </View>
                <View style={styles.brandCopy}>
                  <Text variant="title">Shift Relay</Text>
                  <Text variant="caption" tone="subtle">
                    Field operations
                  </Text>
                </View>
              </View>
              <SessionSummary />
              <View style={styles.navSection}>
                <Text variant="caption" tone="subtle" weight="semibold">
                  Workspace
                </Text>
                {navItems.map((item) => (
                  <TabTrigger key={item.name} name={item.name} asChild>
                    <NavButton item={item} layout="side" badge={badgeFor(item.name)} />
                  </TabTrigger>
                ))}
              </View>
              <View style={styles.sideFooter}>
                <Text variant="caption" tone="subtle">
                  Daily shift logs
                </Text>
                <Text variant="bodySm" weight="medium">
                  Expo SDK 57
                </Text>
              </View>
            </View>
          ) : null}

          {accountId !== null ? <TabSlot style={styles.content} /> : null}

          {accountId === null || wide ? null : (
            <View
              style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, theme.spacing[2]) }]}
              testID="bottom-nav"
            >
              {bottomNavItems(navItems).flatMap((item, index) => [
                ...(index === 2 ? [<ShiftCaptureButton key="capture" />] : []),
                <TabTrigger key={item.name} name={item.name} asChild>
                  <NavButton item={item} layout="bottom" badge={badgeFor(item.name)} />
                </TabTrigger>,
              ])}
            </View>
          )}

          {accountId !== null && !wide && menuOpen ? (
            <>
              <Pressable
                onPress={() => setMenuOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="Close navigation menu"
                testID="menu-scrim"
                style={styles.scrim}
              />
              <View
                accessibilityViewIsModal
                style={[
                  styles.drawer,
                  {
                    paddingTop: insets.top + theme.spacing[4],
                    paddingBottom: insets.bottom + theme.spacing[4],
                  },
                ]}
                testID="mobile-drawer"
              >
                <View style={styles.drawerHeader}>
                  <View
                    style={styles.brandMark}
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                  >
                    <Ionicons
                      name="swap-horizontal"
                      size={theme.fontSize['2xl']}
                      color={theme.color.accentFg}
                    />
                  </View>
                  <View style={styles.drawerTitle}>
                    <Text variant="title">Shift Relay</Text>
                    <Text variant="caption" tone="subtle">
                      Navigation
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setMenuOpen(false)}
                    accessibilityRole="button"
                    accessibilityLabel="Close navigation menu"
                    testID="menu-close"
                    style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
                  >
                    <Ionicons name="close" size={theme.fontSize['2xl']} color={theme.color.text} />
                  </Pressable>
                </View>
                <SessionSummary testIDPrefix="drawer" />
                {navItems.map((item) => (
                  <TabTrigger key={item.name} name={item.name} asChild>
                    <NavButton
                      item={item}
                      layout="side"
                      badge={badgeFor(item.name)}
                      onNavigate={() => setMenuOpen(false)}
                      testIDPrefix="drawer-nav"
                    />
                  </TabTrigger>
                ))}
              </View>
            </>
          ) : null}
        </Tabs>
      </ShellMenuProvider>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

const useStyles = makeStyles((t) => ({
  root: { flex: 1, backgroundColor: t.color.bg },
  rootWide: { flex: 1, flexDirection: 'row', backgroundColor: t.color.bg },
  content: { flex: 1 },
  routeDefinitions: { display: 'none' },
  side: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: t.size.sidebar,
    gap: t.spacing[1],
    paddingHorizontal: t.spacing[3],
    paddingBottom: t.spacing[4],
    backgroundColor: t.color.surface,
    borderRightWidth: 1,
    borderRightColor: t.color.border,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[3],
    paddingHorizontal: t.spacing[2],
    paddingBottom: t.spacing[6],
  },
  brandMark: {
    width: t.size.touchTarget,
    height: t.size.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.color.accent,
    borderRadius: t.radius.lg,
  },
  brandCopy: { flex: 1, gap: t.spacing[1] },
  navSection: { gap: t.spacing[1], paddingHorizontal: t.spacing[1] },
  sideFooter: {
    marginTop: 'auto',
    gap: t.spacing[1],
    padding: t.spacing[3],
    backgroundColor: t.color.bgSubtle,
    borderRadius: t.radius.md,
  },
  bottom: {
    flexDirection: 'row',
    backgroundColor: t.color.surface,
    borderTopWidth: 1,
    borderTopColor: t.color.border,
  },
  scrim: {
    position: 'absolute',
    top: t.spacing[0],
    right: t.spacing[0],
    bottom: t.spacing[0],
    left: t.spacing[0],
    backgroundColor: t.color.overlay,
  },
  drawer: {
    position: 'absolute',
    top: t.spacing[0],
    bottom: t.spacing[0],
    left: t.spacing[0],
    width: t.size.sidebar,
    gap: t.spacing[1],
    paddingHorizontal: t.spacing[3],
    backgroundColor: t.color.surface,
    borderRightWidth: 1,
    borderRightColor: t.color.border,
    boxShadow: t.shadow.lg,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[2],
    paddingLeft: t.spacing[3],
    paddingBottom: t.spacing[4],
  },
  drawerTitle: { flex: 1, gap: t.spacing[1] },
  closeButton: {
    minWidth: t.size.touchTarget,
    minHeight: t.size.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radius.full,
  },
  pressed: { backgroundColor: t.color.bgSubtle },
}));
