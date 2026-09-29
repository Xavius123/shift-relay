# Input

Status: built (2026-09-22)

| Prop | Type | Default |
|------|------|---------|
| `label` | `string` | required (always visible, never placeholder-only) |
| `value` / `onChangeText` | `string` / `(text: string) => void` | required |
| `placeholder` | `string` | — |
| `helperText` | `string` | — |
| `error` | `string` | — (replaces helperText when set) |
| `size` | `Exclude<Size, 'sm'>` (`'md' | 'lg'`) | `'md'` |
| `disabled` | `boolean` | `false` |
| `testID` | `string` | — |

Other `TextInput` props pass through except `style`, `editable` (use `disabled`), and `placeholderTextColor`.

**Tokens:** `bg` · `borderInput` → `borderFocus` when focused → `error` when invalid · `text` · `textPlaceholder` · `textMuted` helper · `error` message · `radius.md` · height `size.control.md` / `size.control.lg` (44 / 52) · padding `spacing.3`.

**Decisions (review, 2026-09-22):** no `sm` size, because 36 is below the 44 touch target. Border uses `borderInput` (ink.500 / ink.400), not `border`: `border` is 1.36:1, and WCAG 1.4.11 asks 3:1 for a field boundary.

**Accessibility:** `accessibilityLabel` = label; the error message has `role="alert"` so it is announced; disabled sets `aria-disabled` (react-native-web ignores `accessibilityState`).

**In this app:** the component remains in the design-system showcase. Shift Relay v1 does not add a search field.

**Verify:** design system screen shows default, error, and disabled (`testID="input-{state}"`); typing into `input-default` updates the value.
