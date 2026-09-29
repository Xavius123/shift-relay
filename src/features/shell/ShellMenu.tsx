import Ionicons from '@expo/vector-icons/Ionicons';
import { createContext, type ReactNode, useContext } from 'react';
import { Pressable, useWindowDimensions } from 'react-native';

import { makeStyles, useTheme } from '@/design-system';

interface ShellMenuContextValue {
  openMenu: () => void;
}

const ShellMenuContext = createContext<ShellMenuContextValue | null>(null);

interface ShellMenuProviderProps {
  children: ReactNode;
  openMenu: () => void;
}

export function ShellMenuProvider({ children, openMenu }: ShellMenuProviderProps) {
  return <ShellMenuContext.Provider value={{ openMenu }}>{children}</ShellMenuContext.Provider>;
}

/** Opens the narrow-screen side navigation. Wide screens already show it persistently. */
export function MenuButton() {
  const context = useContext(ShellMenuContext);
  const styles = useStyles();
  const theme = useTheme();
  const { width } = useWindowDimensions();

  if (width >= theme.breakpoint.wide) return null;
  if (!context) throw new Error('MenuButton must be rendered inside ShellMenuProvider.');

  return (
    <Pressable
      onPress={context.openMenu}
      accessibilityRole="button"
      accessibilityLabel="Open navigation menu"
      testID="menu-button"
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons name="menu" size={theme.fontSize['2xl']} color={theme.color.text} />
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  button: {
    minWidth: t.size.touchTarget,
    minHeight: t.size.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radius.full,
  },
  pressed: { backgroundColor: t.color.bgSubtle },
}));
