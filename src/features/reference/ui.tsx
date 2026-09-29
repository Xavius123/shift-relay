// Small layout and text helpers for the two reference pages. The design system
// components (Text, Card, Badge) replace these; they are not part of the design system.
import type { ReactNode } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';

import { makeStyles } from '@/design-system';

export const layout = { column: 260, swatch: 36, touch: 44 } as const;
const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

export function Page({ testID, children }: { testID: string; children: ReactNode }) {
  const styles = useStyles();
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent} testID={testID}>
      <View style={styles.column}>{children}</View>
    </ScrollView>
  );
}

export function Section({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {intro ? <Body tone="muted">{intro}</Body> : null}
      {children}
    </View>
  );
}

export function Heading({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return (
    <Text style={styles.heading} accessibilityRole="header">
      {children}
    </Text>
  );
}

type Tone = 'default' | 'muted' | 'subtle';

export function Body({ tone = 'default', children }: { tone?: Tone; children: ReactNode }) {
  const styles = useStyles();
  return <Text style={[styles.body, styles[tone]]}>{children}</Text>;
}

export function Small({ tone = 'muted', children }: { tone?: Tone; children: ReactNode }) {
  const styles = useStyles();
  return <Text style={[styles.small, styles[tone]]}>{children}</Text>;
}

export function Strong({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return <Text style={styles.strong}>{children}</Text>;
}

export function Mono({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return <Text style={styles.mono}>{children}</Text>;
}

export function Card({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return <View style={styles.card}>{children}</View>;
}

/** Cards side by side on wide screens, stacked on phones. */
export function Columns({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return <View style={styles.columns}>{children}</View>;
}

export function ColumnItem({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return <View style={styles.columnItem}>{children}</View>;
}

export type PillTone = 'neutral' | 'accent' | 'success' | 'warning' | 'error' | 'info';

export function Pill({ tone, children }: { tone: PillTone; children: ReactNode }) {
  const styles = useStyles();
  const pill = usePillStyles();
  return (
    <View style={[styles.pill, pill[`${tone}Bg`]]}>
      <Text style={[styles.pillText, pill[`${tone}Fg`]]}>{children}</Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  page: { flex: 1, backgroundColor: t.color.bg },
  pageContent: { padding: t.spacing[4], paddingBottom: t.spacing[16] },
  column: { width: '100%', maxWidth: t.size.content, alignSelf: 'center', gap: t.spacing[8] },
  section: { gap: t.spacing[3] },
  heading: {
    color: t.color.text,
    fontSize: t.fontSize['3xl'],
    lineHeight: t.fontSize['3xl'] * t.lineHeight.tight,
    fontWeight: t.fontWeight.bold,
  },
  title: {
    color: t.color.text,
    fontSize: t.fontSize.xl,
    lineHeight: t.fontSize.xl * t.lineHeight.tight,
    fontWeight: t.fontWeight.semibold,
  },
  body: { fontSize: t.fontSize.base, lineHeight: t.fontSize.base * t.lineHeight.normal },
  small: { fontSize: t.fontSize.sm, lineHeight: t.fontSize.sm * t.lineHeight.normal },
  default: { color: t.color.text },
  muted: { color: t.color.textMuted },
  subtle: { color: t.color.textSubtle },
  strong: { color: t.color.text, fontWeight: t.fontWeight.semibold },
  mono: { color: t.color.text, fontFamily: mono, fontSize: t.fontSize.sm },
  card: {
    backgroundColor: t.color.surface,
    borderColor: t.color.border,
    borderWidth: 1,
    borderRadius: t.radius.lg,
    padding: t.spacing[4],
    gap: t.spacing[2],
  },
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing[3] },
  columnItem: { flexGrow: 1, flexBasis: layout.column },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: t.radius.full,
    paddingHorizontal: t.spacing[2],
    paddingVertical: t.spacing[1] / 2,
  },
  pillText: { fontSize: t.fontSize.xs, fontWeight: t.fontWeight.semibold },
}));

const usePillStyles = makeStyles((t) => ({
  neutralBg: { backgroundColor: t.color.bgSubtle },
  neutralFg: { color: t.color.textMuted },
  accentBg: { backgroundColor: t.color.accent },
  accentFg: { color: t.color.accentFg },
  successBg: { backgroundColor: t.color.successBg },
  successFg: { color: t.color.success },
  warningBg: { backgroundColor: t.color.warningBg },
  warningFg: { color: t.color.warning },
  errorBg: { backgroundColor: t.color.errorBg },
  errorFg: { color: t.color.error },
  infoBg: { backgroundColor: t.color.infoBg },
  infoFg: { color: t.color.info },
}));
