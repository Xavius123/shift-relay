import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  type Accent,
  accentNames,
  createTheme,
  makeStyles,
  palette,
  type Scheme,
  type Theme,
  useTheme,
} from '@/design-system';
import { ThemeControls } from '@/features/settings/ThemeControls';
import { Button } from '@/design-system';
import { selectSimulateFailure, setSimulateFailure } from '@/features/dev/devSlice';
import { logsApi } from '@/features/logs/logsApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { ComponentShowcase } from './ComponentShowcase';

import { contrast, contrastPairs, semanticRows } from './content';
import {
  Body,
  Card,
  ColumnItem,
  Columns,
  Heading,
  layout,
  Mono,
  Page,
  Pill,
  Section,
  Small,
  Strong,
} from './ui';

// Review surface for the tokens, themes, and built component inventory.

const pipeline = [
  { step: 'tokens/*.json', note: 'W3C DTCG source: primitive → accent alias → semantic' },
  {
    step: 'Style Dictionary',
    note: 'RN transforms: unitless sizes, weight literals, boxShadow strings',
  },
  {
    step: 'generated/*.ts + tokens.css',
    note: 'Typed theme objects for RN, CSS variables for web',
  },
  {
    step: 'check-contrast',
    note: '192 pairs across 6 themes; fails the build below the WCAG minimum',
  },
  { step: 'useTheme()', note: 'ThemeProvider picks light | dark × accent from uiSlice (Redux)' },
] as const;

const components = [
  {
    name: 'Text',
    on: 'RN Text',
    variants: 'heading · title · body · bodySm · caption; tone muted / subtle',
  },
  {
    name: 'Button',
    on: 'Pressable',
    variants: 'primary · secondary · ghost · outline · danger; sm / md / lg; loading',
  },
  { name: 'Card', on: 'View / Pressable', variants: 'default · elevated · interactive; padding' },
  {
    name: 'Badge',
    on: 'View + Text',
    variants: 'default · accent · success · error · warning · info; max overflow',
  },
  { name: 'Input', on: 'TextInput', variants: 'label, helper, error; focus ring from borderFocus' },
] as const;

const designNotes = [
  'Care blue is the product default; Plum and Sea glass are the two optional themes.',
  'Shadows use RN boxShadow strings (RN 0.76+ and web) instead of separate platform props. Keep?',
] as const;

export function DesignSystemReference() {
  const styles = useStyles();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const simulateFailure = useAppSelector(selectSimulateFailure);

  return (
    <Page testID="screen-design-system">
      <View style={styles.hero}>
        <Small tone="subtle">Built from tokens/ by npm run tokens</Small>
        <Heading>Design system</Heading>
        <Body tone="muted">
          One token source builds a typed React Native theme and a CSS file. Components read
          semantic tokens only, so light, dark, and every accent work with no extra code.
        </Body>
      </View>

      <Section
        title="Theme"
        intro="These controls write to Redux (uiSlice). The whole app re-themes, including the header and the dashboard."
      >
        <ThemeControls />
      </Section>

      <Section
        title="Network simulation"
        intro="Try the loading, error, retry, and draft recovery states on the operational screens."
      >
        <Button
          variant="outline"
          onPress={() => {
            dispatch(setSimulateFailure(!simulateFailure));
            dispatch(logsApi.util.invalidateTags(['Log', 'Issue']));
          }}
          accessibilityLabel="Simulate network failure"
          testID="simulate-network-failure"
        >
          {simulateFailure ? 'Simulate network failure: On' : 'Simulate network failure: Off'}
        </Button>
      </Section>

      <Section
        title="Components"
        intro="Every variant, size, and state from the specs. Switch the theme above and they follow."
      >
        <Card>
          <ComponentShowcase />
        </Card>
      </Section>

      <Section
        title="Light and dark"
        intro="The same semantic tokens in both schemes, for the current accent. The accent flips from its 600 step to its 400 step in dark mode so it stays readable on near-black."
      >
        <Columns>
          <ColumnItem>
            <ThemePreview scheme="light" accent={theme.accent} />
          </ColumnItem>
          <ColumnItem>
            <ThemePreview scheme="dark" accent={theme.accent} />
          </ColumnItem>
        </Columns>
      </Section>

      <Section
        title="Pipeline"
        intro="Run npm run tokens:self-test to watch the contrast check catch a too-light color."
      >
        <Card>
          {pipeline.map((p, i) => (
            <View key={p.step} style={styles.pipelineRow}>
              <Mono>{`${i + 1}. ${p.step}`}</Mono>
              <Small>{p.note}</Small>
            </View>
          ))}
        </Card>
      </Section>

      <Section
        title="Contrast"
        intro={`WCAG 2.x ratios for ${theme.accent}. The build checks more pairs than shown here.`}
      >
        <ContrastTable accent={theme.accent} />
      </Section>

      <Section
        title="Semantic tokens"
        intro="What components use. Screens never touch a primitive color."
      >
        <Card>
          {semanticRows.map((row) => (
            <SemanticTokenRow key={row.token} row={row} accent={theme.accent} />
          ))}
        </Card>
      </Section>

      <Section
        title="Palette"
        intro="Primitives. ink is a blue-charcoal neutral; Care blue is the product default, while status meaning always remains labeled."
      >
        <Card>
          <Strong>ink</Strong>
          <SwatchRow entries={Object.entries(palette.ink)} />
          {accentNames.map((name) => (
            <View key={name} style={styles.paletteGroup}>
              <Strong>{name}</Strong>
              <SwatchRow entries={Object.entries(palette[name])} />
            </View>
          ))}
          <View style={styles.paletteGroup}>
            <Strong>status</Strong>
            <View style={styles.statusGrid}>
              {Object.entries(palette.status).map(([name, byScheme]) => (
                <View key={name} style={styles.statusItem}>
                  {Object.entries(byScheme).map(([scheme, { fg, bg }]) => (
                    <View key={scheme} style={[styles.statusChip, { backgroundColor: bg }]}>
                      <Text style={[styles.statusText, { color: fg }]}>
                        {`${name} · ${scheme}`}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        </Card>
      </Section>

      <Section title="Scales" intro="Theme-independent. Base unit 4.">
        <Columns>
          <ColumnItem>
            <Card>
              <Strong>spacing</Strong>
              {Object.entries(theme.spacing).map(([key, value]) => (
                <View key={key} style={styles.scaleRow}>
                  <View style={styles.scaleKey}>
                    <Mono>{key}</Mono>
                  </View>
                  <View style={[styles.spacingBar, { width: value }]} />
                  <Small tone="subtle">{value}</Small>
                </View>
              ))}
            </Card>
          </ColumnItem>
          <ColumnItem>
            <Card>
              <Strong>radius</Strong>
              <View style={styles.radiusRow}>
                {Object.entries(theme.radius).map(([key, value]) => (
                  <View key={key} style={styles.radiusItem}>
                    <View style={[styles.radiusBox, { borderRadius: value }]} />
                    <Small tone="subtle">{key}</Small>
                  </View>
                ))}
              </View>
              <Strong>shadow</Strong>
              <View style={styles.radiusRow}>
                {Object.entries(theme.shadow).map(([key, value]) => (
                  <View key={key} style={styles.radiusItem}>
                    <View style={[styles.shadowBox, { boxShadow: value }]} />
                    <Small tone="subtle">{key}</Small>
                  </View>
                ))}
              </View>
              <Strong>type</Strong>
              {Object.entries(theme.fontSize).map(([key, value]) => (
                <Text key={key} style={[styles.typeSample, { fontSize: value }]} numberOfLines={1}>
                  {`${key} · ${value}`}
                </Text>
              ))}
            </Card>
          </ColumnItem>
        </Columns>
      </Section>

      <Section
        title="Inventory"
        intro="v1 inventory. Each is built from its spec in docs/specs/components/ on RN primitives."
      >
        <Card>
          {components.map((comp) => (
            <View key={comp.name} style={styles.componentRow}>
              <View style={styles.rowHeader}>
                <View style={styles.grow}>
                  <Strong>{comp.name}</Strong>
                </View>
                <Small tone="subtle">{comp.on}</Small>
                <Pill tone="success">built</Pill>
              </View>
              <Small>{comp.variants}</Small>
            </View>
          ))}
        </Card>
      </Section>

      <Section title="Design notes">
        <Card>
          {designNotes.map((q) => (
            <View key={q} style={styles.question}>
              <Body tone="muted">•</Body>
              <View style={styles.grow}>
                <Body>{q}</Body>
              </View>
            </View>
          ))}
        </Card>
      </Section>
    </Page>
  );
}

/** A fixed-scheme preview, independent of the app's current scheme. */
function ThemePreview({ scheme, accent }: { scheme: Scheme; accent: Accent }) {
  const s = useMemo(() => previewStyles(createTheme(scheme, accent)), [scheme, accent]);
  return (
    <View style={s.preview} testID={`preview-${scheme}`}>
      <Text style={s.label}>{scheme}</Text>
      <View style={s.card}>
        <View style={s.header}>
          <Text style={s.title}>Secure damaged dock plate</Text>
          <View style={[s.badge, s.badgeAccent]}>
            <Text style={[s.badgeText, s.badgeAccentText]}>acknowledged</Text>
          </View>
        </View>
        <Text style={s.meta}>North loading bay · night shift</Text>
        <Text style={s.body}>Keep the lane closed until maintenance inspects the hinge.</Text>
        <View style={[s.badge, s.badgeWarning]}>
          <Text style={[s.badgeText, s.badgeWarningText]}>high priority</Text>
        </View>
      </View>
      <View style={s.button}>
        <Text style={s.buttonText}>Primary action</Text>
      </View>
      <View style={s.banner}>
        <Text style={s.bannerText}>Couldn&apos;t load shift logs. Retry</Text>
      </View>
    </View>
  );
}

function previewStyles(t: Theme) {
  return StyleSheet.create({
    preview: {
      backgroundColor: t.color.bg,
      borderColor: t.color.border,
      borderWidth: 1,
      borderRadius: t.radius.lg,
      padding: t.spacing[4],
      gap: t.spacing[3],
    },
    label: {
      color: t.color.textSubtle,
      fontSize: t.fontSize.xs,
      fontWeight: t.fontWeight.semibold,
      textTransform: 'uppercase',
    },
    card: {
      backgroundColor: t.color.surface,
      borderColor: t.color.border,
      borderWidth: 1,
      borderRadius: t.radius.md,
      padding: t.spacing[3],
      gap: t.spacing[2],
      boxShadow: t.shadow.sm,
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { color: t.color.text, fontSize: t.fontSize.lg, fontWeight: t.fontWeight.semibold },
    meta: { color: t.color.textMuted, fontSize: t.fontSize.sm },
    body: {
      color: t.color.text,
      fontSize: t.fontSize.base,
      lineHeight: t.fontSize.base * t.lineHeight.normal,
    },
    badge: {
      alignSelf: 'flex-start',
      borderRadius: t.radius.full,
      paddingHorizontal: t.spacing[2],
      paddingVertical: t.spacing[1] / 2,
    },
    badgeText: { fontSize: t.fontSize.xs, fontWeight: t.fontWeight.semibold },
    badgeAccent: { backgroundColor: t.color.accent },
    badgeAccentText: { color: t.color.accentFg },
    badgeWarning: { backgroundColor: t.color.warningBg },
    badgeWarningText: { color: t.color.warning },
    button: {
      minHeight: t.size.touchTarget,
      borderRadius: t.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.color.accent,
    },
    buttonText: {
      color: t.color.accentFg,
      fontSize: t.fontSize.base,
      fontWeight: t.fontWeight.semibold,
    },
    banner: { borderRadius: t.radius.md, padding: t.spacing[3], backgroundColor: t.color.errorBg },
    bannerText: { color: t.color.error, fontSize: t.fontSize.sm },
  });
}

function SemanticTokenRow({ row, accent }: { row: (typeof semanticRows)[number]; accent: Accent }) {
  const styles = useStyles();
  const light = createTheme('light', accent).color[row.token];
  const dark = createTheme('dark', accent).color[row.token];
  return (
    <View style={styles.tokenRow}>
      <View style={styles.swatchPair}>
        <View style={[styles.swatch, { backgroundColor: light }]} />
        <View style={[styles.swatch, { backgroundColor: dark }]} />
      </View>
      <View style={styles.grow}>
        <Mono>{row.token}</Mono>
        <Small>{row.use}</Small>
      </View>
      <Small tone="subtle">{`${row.light} / ${row.dark}`}</Small>
    </View>
  );
}

function ContrastTable({ accent }: { accent: Accent }) {
  const styles = useStyles();
  const themes = useMemo(
    () => ({ light: createTheme('light', accent), dark: createTheme('dark', accent) }),
    [accent],
  );
  return (
    <Card>
      <View style={styles.contrastRow}>
        <View style={styles.grow}>
          <Small tone="subtle">pair (min)</Small>
        </View>
        <View style={styles.contrastCell}>
          <Small tone="subtle">light</Small>
        </View>
        <View style={styles.contrastCell}>
          <Small tone="subtle">dark</Small>
        </View>
      </View>
      {contrastPairs.map((pair) => (
        <View key={`${pair.fg}-${pair.bg}`} style={styles.contrastRow}>
          <View style={styles.grow}>
            <Mono>{`${pair.fg} on ${pair.bg}`}</Mono>
            <Small tone="subtle">
              {pair.banned ? 'Not allowed by DESIGN.md: use textMuted here' : `min ${pair.min}`}
            </Small>
          </View>
          {(['light', 'dark'] as const).map((scheme) => {
            const ratio = contrast(themes[scheme].color[pair.fg], themes[scheme].color[pair.bg]);
            const pass = ratio >= pair.min;
            return (
              <View key={scheme} style={styles.contrastCell}>
                <Pill tone={pass ? 'success' : pair.banned ? 'warning' : 'error'}>
                  {ratio.toFixed(2)}
                </Pill>
              </View>
            );
          })}
        </View>
      ))}
    </Card>
  );
}

function SwatchRow({ entries }: { entries: [string, string][] }) {
  const styles = useStyles();
  return (
    <View style={styles.swatchRow}>
      {entries.map(([step, hex]) => (
        <View key={step} style={styles.swatchItem}>
          <View style={[styles.swatch, { backgroundColor: hex }]} />
          <Small tone="subtle">{step}</Small>
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  hero: { gap: t.spacing[3] },
  grow: { flex: 1 },
  rowHeader: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[3] },
  pipelineRow: { gap: t.spacing[1], paddingVertical: t.spacing[1] },
  contrastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[2],
    paddingVertical: t.spacing[1],
  },
  contrastCell: { width: t.spacing[16], alignItems: 'flex-end' },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[3],
    paddingVertical: t.spacing[1],
  },
  swatchPair: { flexDirection: 'row' },
  swatch: {
    width: layout.swatch,
    height: layout.swatch,
    borderRadius: t.radius.sm,
    borderWidth: 1,
    borderColor: t.color.border,
  },
  paletteGroup: { gap: t.spacing[2], paddingTop: t.spacing[2] },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing[2] },
  swatchItem: { alignItems: 'center', gap: t.spacing[1] },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing[2] },
  statusItem: { gap: t.spacing[1] },
  statusChip: {
    borderRadius: t.radius.md,
    paddingHorizontal: t.spacing[3],
    paddingVertical: t.spacing[2],
  },
  statusText: { fontSize: t.fontSize.sm, fontWeight: t.fontWeight.medium },
  scaleRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[2] },
  scaleKey: { width: t.spacing[6] },
  spacingBar: { height: t.spacing[3], backgroundColor: t.color.accent, borderRadius: t.radius.sm },
  radiusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing[3] },
  radiusItem: { alignItems: 'center', gap: t.spacing[1] },
  radiusBox: {
    width: layout.swatch,
    height: layout.swatch,
    backgroundColor: t.color.bgSubtle,
    borderWidth: 1,
    borderColor: t.color.border,
  },
  shadowBox: {
    width: layout.swatch,
    height: layout.swatch,
    borderRadius: t.radius.md,
    backgroundColor: t.color.surface,
  },
  typeSample: { color: t.color.text },
  componentRow: { gap: t.spacing[1], paddingVertical: t.spacing[1] },
  question: { flexDirection: 'row', gap: t.spacing[2] },
}));
