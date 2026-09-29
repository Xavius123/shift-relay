import Ionicons from '@expo/vector-icons/Ionicons';
import type { TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, Text, View } from 'react-native';

import { Badge, makeStyles, useTheme } from '@/design-system';

import type { NavItem } from './navItems';

type NavButtonProps = TabTriggerSlotProps & {
  item: NavItem;
  layout: 'side' | 'bottom';
  onNavigate?: () => void;
  testIDPrefix?: string;
  /** A count shown beside the label, such as open issues. Hidden at zero. */
  badge?: number;
};

/**
 * One nav entry. TabTrigger (asChild) passes in onPress, isFocused, and the ref, so this
 * only draws the button: a row in the side nav, or an icon over a label in the bottom tabs.
 */
export function NavButton({
  item,
  layout,
  isFocused = false,
  onNavigate,
  testIDPrefix = 'nav',
  badge = 0,
  ...pressableProps
}: NavButtonProps) {
  const styles = useStyles();
  const theme = useTheme();
  const side = layout === 'side';
  const color = isFocused ? theme.color.accent : theme.color.textMuted;
  const icon = (
    <Ionicons
      name={isFocused ? item.iconActive : item.icon}
      size={side ? theme.fontSize.xl : theme.fontSize['2xl']}
      color={color}
    />
  );

  return (
    <Pressable
      {...pressableProps}
      onPress={(event) => {
        pressableProps.onPress?.(event);
        onNavigate?.();
      }}
      accessibilityRole="tab"
      accessibilityLabel={badge > 0 ? `${item.label}, ${badge} open` : item.label}
      aria-selected={isFocused}
      testID={`${testIDPrefix}-${item.name}`}
      style={({ pressed }) => [
        side ? styles.side : styles.bottom,
        side && isFocused && styles.sideActive,
        pressed && styles.pressed,
      ]}
    >
      {icon}
      <Text
        style={[
          side ? styles.sideLabel : styles.bottomLabel,
          isFocused ? styles.labelActive : styles.label,
        ]}
        numberOfLines={1}
      >
        {item.label}
      </Text>
      {badge > 0 ? (
        <View style={side ? styles.sideBadge : styles.bottomBadge}>
          <Badge variant="error" testID={`${testIDPrefix}-${item.name}-badge`}>
            {String(badge)}
          </Badge>
        </View>
      ) : null}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  side: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[3],
    minHeight: t.size.touchTarget,
    paddingHorizontal: t.spacing[3],
    borderRadius: t.radius.md,
  },
  sideActive: { backgroundColor: t.color.bgSubtle },
  bottom: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing[1] / 2,
    minHeight: t.size.control.lg,
    paddingTop: t.spacing[1],
  },
  pressed: { opacity: t.opacity.pressed },
  sideBadge: { marginLeft: 'auto' },
  bottomBadge: { position: 'absolute', top: t.spacing[0], right: t.spacing[2] },
  sideLabel: { fontSize: t.fontSize.sm, fontWeight: t.fontWeight.medium },
  bottomLabel: { fontSize: t.fontSize.xs, fontWeight: t.fontWeight.medium },
  label: { color: t.color.textMuted },
  labelActive: { color: t.color.text },
}));
