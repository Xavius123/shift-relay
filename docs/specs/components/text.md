# Text

Status: built (2026-09-22)

**Purpose:** the only way to render text, so type scale and color always come from tokens.

| Prop | Type | Default |
|------|------|---------|
| `variant` | `'heading' \| 'title' \| 'body' \| 'bodySm' \| 'caption'` | `'body'` |
| `tone` | `'default' \| 'muted' \| 'subtle' \| 'inverse' \| 'accent' \| 'error'` | `'default'` |
| `weight` | `'regular' \| 'medium' \| 'semibold' \| 'bold'` | from variant |
| `numberOfLines` | `number` | — |
| `testID` | `string` | — |
| `children` | `ReactNode` | — |

**Tokens:** `fontSize` 3xl/xl/base/sm/xs by variant · `lineHeight` normal (tight for heading/title), computed `fontSize × lineHeight` · `color.text`, `textMuted`, `textSubtle`, `textInverse`, `accent`, `error` by tone.

**Accessibility:** `heading` and `title` set `accessibilityRole="header"`. Supports Dynamic Type (no `allowFontScaling={false}`).

**Must not:** accept `style` or a raw color.

**Verify:** design system screen shows one line per variant (`testID="text-{variant}"`).
