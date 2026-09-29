# Card

Status: built (2026-09-22)

| Prop | Type | Default |
|------|------|---------|
| `variant` | `CardVariant` = `'default' \| 'elevated' \| 'interactive'` | `'default'` |
| `padding` | `CardPadding` = `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` |
| `onPress` | `() => void` | required when `interactive`, otherwise not allowed (typed as a discriminated union) |
| `accessibilityLabel` | `string` | required when `interactive` |
| `testID` | `string` | — |
| `children` | `ReactNode` | — |

**Tokens:** `surface` bg · `border` 1px (default) · `shadow.md` as `boxShadow` (elevated) · `radius.lg` · padding `spacing` 0/3/4/6 · pressed `bgSubtleHover` (interactive).

**Accessibility:** interactive cards are `accessibilityRole="button"` with a label; non-interactive cards are plain views.

**Must not:** allow `onPress` on a non-interactive card (compile error).

**Verify:** design system screen shows each variant (`testID="card-{variant}"`). Dashboard shift cards and log history use `interactive`.
