# Components

The design system's components live in `src/design-system/components/`, written so they could be extracted into a package later. How screens *compose* these components is in [DESIGN.md](../../DESIGN.md).

## Rules

1. **Spec first.** Each component has a spec in [docs/specs/components/](../specs/components/). The spec is the contract; the code and the E2E assertions follow it.
2. **Shared types.** Variant and size unions live in `src/design-system/types.ts` and are reused across components:
   - `Size = 'sm' | 'md' | 'lg'`
   - `ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'`
   - `StatusVariant = 'default' | 'accent' | 'success' | 'error' | 'warning' | 'info'`
   - `CardVariant`, `CardPadding = 'none' | 'sm' | 'md' | 'lg'`

   The names follow common web conventions, so the API reads familiar to a web developer.
3. **Tokens only.** Styles come from `useTheme()`. No literals, no inline styles, no `StyleSheet` outside `makeStyles(theme)`.
4. **Variants over overrides.** No `style` prop that lets callers restyle internals. Layout-only escape hatch: `containerStyle` restricted to margin and flex props, where the spec allows it.
5. **Accessible by default.** Correct `accessibilityRole`, required labels for icon-only controls, `accessibilityState` for disabled/busy, 44×44 minimum hit area (`hitSlop` if the visual is smaller).
6. **Every component has a `testID` prop** passed to its root, so E2E specs can find it (`data-testid` on web).
7. **Headless where behavior is hard.** Simple components are built on RN primitives (`Pressable`, `Text`, `TextInput`, `View`). A complex component (Select, Dialog) may use `@rn-primitives` ([ADR 0003](../decisions/0003-own-components-on-rn-primitives.md)).

## File layout

```
src/design-system/components/Button/
  Button.tsx        component + makeStyles
  index.ts          export { Button } and export type { ButtonProps }
  Button.test.tsx   planned
```

Exported from `src/design-system/index.ts`. Features import from `@/design-system`, never from a component's folder.

## v1 inventory

| Component | Built on | Spec |
|-----------|------------------------|------|
| Text | RN `Text` | [text.md](../specs/components/text.md) |
| Button | `Pressable` | [button.md](../specs/components/button.md) |
| Card | `View` / `Pressable` | [card.md](../specs/components/card.md) |
| Badge | `View` + `Text` | [badge.md](../specs/components/badge.md) |
| Input | `TextInput` | [input.md](../specs/components/input.md) |

Later, if time allows: Skeleton, and Select via `@rn-primitives`.
