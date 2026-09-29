---
name: new-component
description: >-
  Build one Shift Relay design-system component from its spec in
  docs/specs/components/, using tokens only, add it to the design system screen
  and its E2E flow, then run /verify. Use when the user says /new-component,
  add a component, build the Button, or implement a spec.
---

# New component — spec → code → showcase → verify

`/new-component Button`

## Step 1 — The spec gate

Open `docs/specs/components/{name}.md` (lowercase).

- **No spec:** draft one using the format of the existing specs. Set `Status: draft`. **Stop** and ask the human to review it.
- **`Status: draft`:** stop and say what needs reviewing.
- **`Status: reviewed`:** continue.

## Step 2 — Check shared types

Read `src/design-system/types.ts`. Reuse the shared unions in it (`Size`, `ButtonVariant`, `StatusVariant`, `CardVariant`, `CardPadding`, `TextVariant`, `TextTone`, `FontWeightName`, and whatever has been added since) instead of redefining them. A new shared union goes in that file, not in the component.

## Step 3 — Build

Create `src/design-system/components/{Name}/{Name}.tsx` and `index.ts`, following the component rules in [design-system.md](../../../docs/design-system.md#components):

- Props exactly as in the spec's table. Use discriminated unions where the spec makes a prop conditional.
- Styles from `useTheme()` via `makeStyles(theme)`. No literals, no inline styles, no `style` prop.
- `testID` on the root. Accessibility exactly as the spec says.
- Export from `src/design-system/index.ts`.

## Step 4 — Showcase and E2E

- Add the component to `src/features/reference/ComponentShowcase.tsx`: every variant, size, and state the spec lists, using the `testID`s from its **Verify** line.
- Add those assertions to `e2e/design-system.spec.ts`.
- Once Jest is set up: add `{Name}.test.tsx` covering the spec's behavior rules.

## Step 5 — Verify and record

Run `/verify`. On pass, set the spec to `Status: built`. Report:

```
Component:  Button
Spec:       docs/specs/components/button.md (built)
Types:      reused Size, … | added: …
Files:      …
Verify:     typecheck ✓ · lint ✓ · e2e ✓
```

If you had to deviate from the spec, say so. Do not quietly change the spec to match the code.

## Not a design-system component

A component shared across features that is not part of the design system (for example `src/features/common/CloseButton.tsx`) does not need a spec or this skill. It still follows the code rules in `AGENTS.md`: tokens only through `useTheme()`, no inline styles, shared types, an `accessibilityRole` and label, and touch targets of at least 44×44. It goes in `src/features/common/`.
