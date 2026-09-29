# Button

Status: built (2026-09-22)

| Prop | Type | Default |
|------|------|---------|
| `variant` | `ButtonVariant` = `'primary' \| 'secondary' \| 'ghost' \| 'outline' \| 'danger'` | `'primary'` |
| `size` | `Size` = `'sm' \| 'md' \| 'lg'` | `'md'` |
| `onPress` | `() => void` | required (RN-only) |
| `disabled` | `boolean` | `false` |
| `loading` | `boolean` | `false` (RN addition: shows a spinner and blocks presses) |
| `accessibilityLabel` | `string` | children text |
| `testID` | `string` | — |
| `children` | `string` | required |

**States:** default · pressed (`accentActive`/`bgSubtleHover`) · disabled (`opacity.disabled`) · loading.

**Tokens:** (danger and secondary-pressed pairs are in the contrast check) primary `accent` / `accentFg` · secondary `bgSubtle` / `text` · outline `border` / `text` · ghost transparent / `accent` · danger `error` / `textInverse` · padding `spacing` 2/3/4 by size · `radius.md` · font `sm`/`base`/`lg` semibold.

**Accessibility:** `accessibilityRole="button"`, `aria-disabled` and `aria-busy` (react-native-web ignores `accessibilityState`; see AI.md), min height `size.touchTarget` (sm uses `hitSlop` to reach it).

**Must not:** accept `style`; fire `onPress` while disabled or loading.

**Verify:** design system screen shows every variant × size (`testID="button-{variant}-{size}"`); tapping `button-primary-md` increments a visible counter.
