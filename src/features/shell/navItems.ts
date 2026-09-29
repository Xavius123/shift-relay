import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Ionicons>['name'];

export interface NavItem {
  /** Tab route name; also the testID suffix (`nav-{name}`). */
  name: string;
  href: '/' | '/logs' | '/issues' | '/photos' | '/design-system' | '/sign-in';
  label: string;
  icon: IconName;
  iconActive: IconName;
  /** Only in the side nav and the phone drawer, never the bottom tabs. */
  sideOnly?: boolean;
}

/** The app's top-level sections, in order. Side nav on wide screens, bottom tabs on phones. */
export const navItems: readonly NavItem[] = [
  {
    name: 'sign-in',
    href: '/sign-in',
    label: 'Sign in',
    icon: 'person-circle-outline',
    iconActive: 'person-circle',
    sideOnly: true,
  },
  { name: 'dashboard', href: '/', label: 'Dashboard', icon: 'grid-outline', iconActive: 'grid' },
  {
    name: 'logs',
    href: '/logs',
    label: 'Logs',
    icon: 'reader-outline',
    iconActive: 'reader',
  },
  {
    name: 'issues',
    href: '/issues',
    label: 'Issues',
    icon: 'alert-circle-outline',
    iconActive: 'alert-circle',
  },
  {
    name: 'photos',
    href: '/photos',
    label: 'Shift Photos',
    icon: 'images-outline',
    iconActive: 'images',
  },
  {
    name: 'design-system',
    href: '/design-system',
    label: 'Design system',
    icon: 'color-palette-outline',
    iconActive: 'color-palette',
    sideOnly: true,
  },
];

/** Phone bottom tabs, left to right. The camera button sits after the second (see AppShell). */
const bottomOrder: readonly string[] = ['logs', 'photos', 'issues', 'dashboard'];

export function bottomNavItems(items: readonly NavItem[]): readonly NavItem[] {
  return bottomOrder.flatMap((name) =>
    items.filter((item) => item.name === name && !item.sideOnly),
  );
}
