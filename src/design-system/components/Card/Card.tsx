import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { makeStyles } from '../../theme/ThemeProvider';
import type { CardPadding, CardVariant } from '../../types';

interface CardBaseProps {
  padding?: CardPadding;
  testID?: string;
  children?: ReactNode;
}

interface StaticCardProps extends CardBaseProps {
  variant?: Exclude<CardVariant, 'interactive'>;
  onPress?: never;
  accessibilityLabel?: never;
}

interface InteractiveCardProps extends CardBaseProps {
  variant: 'interactive';
  onPress: () => void;
  accessibilityLabel: string;
}

/** `onPress` is only allowed (and then required) on an interactive card. */
export type CardProps = StaticCardProps | InteractiveCardProps;

export function Card(props: CardProps) {
  const styles = useStyles();
  const { padding = 'md', testID, children } = props;
  const testIDProp = testID !== undefined ? { testID } : {};

  if (props.variant === 'interactive') {
    return (
      <Pressable
        onPress={props.onPress}
        accessibilityRole="button"
        accessibilityLabel={props.accessibilityLabel}
        style={({ pressed }) => [
          styles.root,
          styles.bordered,
          styles[padding],
          pressed && styles.pressed,
        ]}
        {...testIDProp}
      >
        {children}
      </Pressable>
    );
  }

  const variant = props.variant ?? 'default';
  return (
    <View
      style={[
        styles.root,
        variant === 'elevated' ? styles.elevated : styles.bordered,
        styles[padding],
      ]}
      {...testIDProp}
    >
      {children}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { backgroundColor: t.color.surface, borderRadius: t.radius.lg, gap: t.spacing[2] },
  bordered: { borderWidth: 1, borderColor: t.color.border },
  elevated: { boxShadow: t.shadow.md },
  pressed: { backgroundColor: t.color.bgSubtleHover },
  none: { padding: t.spacing[0] },
  sm: { padding: t.spacing[3] },
  md: { padding: t.spacing[4] },
  lg: { padding: t.spacing[6] },
}));
