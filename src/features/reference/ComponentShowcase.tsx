import { type ReactNode, useState } from 'react';
import { View } from 'react-native';

import {
  Badge,
  Button,
  type ButtonVariant,
  Card,
  Input,
  makeStyles,
  type Size,
  type StatusVariant,
  Text,
  type TextVariant,
} from '@/design-system';

// Every variant, size, and state from docs/specs/components/, with the testIDs from each
// spec's Verify line. e2e/design-system.spec.ts checks them.

const textVariants: readonly TextVariant[] = ['heading', 'title', 'body', 'bodySm', 'caption'];
const buttonVariants: readonly ButtonVariant[] = [
  'primary',
  'secondary',
  'outline',
  'ghost',
  'danger',
];
const sizes: readonly Size[] = ['sm', 'md', 'lg'];
const statusVariants: readonly StatusVariant[] = [
  'default',
  'accent',
  'success',
  'error',
  'warning',
  'info',
];

export function ComponentShowcase() {
  const styles = useStyles();
  const [presses, setPresses] = useState(0);
  const [cardPresses, setCardPresses] = useState(0);
  const [query, setQuery] = useState('');

  return (
    <View style={styles.root}>
      <Group title="Text">
        {textVariants.map((variant) => (
          <Text key={variant} variant={variant} testID={`text-${variant}`}>
            {`${variant}: The quick brown fox`}
          </Text>
        ))}
        <View style={styles.row}>
          <Text tone="muted">muted</Text>
          <Text tone="subtle">subtle</Text>
          <Text tone="accent">accent</Text>
          <Text tone="error">error</Text>
          <Text weight="bold">bold</Text>
        </View>
      </Group>

      <Group title="Button">
        {buttonVariants.map((variant) => (
          <View key={variant} style={styles.row}>
            {sizes.map((size) => (
              <Button
                key={size}
                variant={variant}
                size={size}
                onPress={() => setPresses((n) => n + 1)}
                testID={`button-${variant}-${size}`}
              >
                {`${variant} ${size}`}
              </Button>
            ))}
          </View>
        ))}
        <View style={styles.row}>
          <Button onPress={() => setPresses((n) => n + 1)} disabled testID="button-disabled">
            Disabled
          </Button>
          <Button onPress={() => setPresses((n) => n + 1)} loading testID="button-loading">
            Loading
          </Button>
        </View>
        <Text variant="bodySm" tone="muted" testID="button-counter">
          {`Pressed ${presses} times`}
        </Text>
      </Group>

      <Group title="Card">
        <Card testID="card-default">
          <Text variant="title">Default</Text>
          <Text tone="muted">Surface with a border.</Text>
        </Card>
        <Card variant="elevated" testID="card-elevated">
          <Text variant="title">Elevated</Text>
          <Text tone="muted">Surface with shadow.md.</Text>
        </Card>
        <Card
          variant="interactive"
          onPress={() => setCardPresses((n) => n + 1)}
          accessibilityLabel="Interactive card"
          testID="card-interactive"
        >
          <Text variant="title">Interactive</Text>
          <Text tone="muted" testID="card-counter">{`Pressed ${cardPresses} times`}</Text>
        </Card>
      </Group>

      <Group title="Badge">
        <View style={styles.row}>
          {statusVariants.map((variant) => (
            <Badge key={variant} variant={variant} testID={`badge-${variant}`}>
              {variant}
            </Badge>
          ))}
          <Badge variant="accent" max={99} testID="badge-max">
            {120}
          </Badge>
        </View>
      </Group>

      <Group title="Input">
        <Input
          label="Search records"
          value={query}
          onChangeText={setQuery}
          placeholder="Name or job"
          helperText="Example design-system input."
          testID="input-default"
        />
        <Text variant="caption" tone="subtle" testID="input-echo">
          {`Value: ${query}`}
        </Text>
        <Input
          label="Price"
          value="forty nine"
          onChangeText={() => undefined}
          error="Use a number, like 49."
          testID="input-error"
        />
        <Input
          label="Checked on"
          value="2026-09-01"
          onChangeText={() => undefined}
          disabled
          size="lg"
          testID="input-disabled"
        />
      </Group>
    </View>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  const styles = useStyles();
  return (
    <View style={styles.group}>
      <Text variant="bodySm" weight="semibold" tone="muted">
        {title}
      </Text>
      {children}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { gap: t.spacing[6] },
  group: { gap: t.spacing[3] },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: t.spacing[3] },
}));
