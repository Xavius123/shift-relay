# Design system

How tokens become a theme, how the theme reaches components, and the rules components follow. For which token to use on a screen, see [DESIGN.md](../DESIGN.md).

## The flow

```
tokens/*.json ──npm run tokens──▶ generated/*.ts ──▶ createTheme(scheme, accent) ──▶ ThemeProvider ──▶ useTheme() / makeStyles()
                  │                                        ▲
                  └─▶ check-contrast (fails the build)      │
                                                  uiSlice { colorScheme, accent }  ◀── ThemeControls (dispatch)
                                                           │
                                                  AppThemeProvider resolves "system" from the device
```

1. **Source.** `tokens/` holds W3C DTCG JSON in three tiers ([ADR 0006](decisions/0006-own-palette-and-in-repo-token-pipeline.md)).
2. **Build.** `npm run tokens` runs Style Dictionary once per scheme × accent (6 builds), writes the typed theme and `tokens.css`, then checks contrast.
3. **State.** `uiSlice` holds `colorScheme` (`system` / `light` / `dark`) and `accent`. A fresh session starts with Light and Care blue.
4. **Provide.** `AppThemeProvider` reads the slice, resolves `system` with `useColorScheme()`, and passes `scheme` and `accent` to `ThemeProvider`.
5. **Consume.** Components call `makeStyles((t) => …)` or `useTheme()`. A change in Redux re-themes the whole app.

`src/design-system/` never imports the store. `ThemeProvider` takes `scheme` and `accent` as props; `AppThemeProvider` in `features/settings` is the only bridge.

## Token tiers

| Tier | Files | Holds | Referenced as |
|------|-------|-------|---------------|
| Primitive | `tokens/primitive/color.json`, `scale.json` | `ink` neutrals, `care` / `plum` / `seaGlass`, status colors; spacing, size, radius, type, opacity, shadow | `{ink.50}` |
| Accent alias | `tokens/accent/{care,plum,seaGlass}.json` | Points `accent.200…800` at one accent scale | `{accent.600}` |
| Semantic | `tokens/semantic/{light,dark}.json` | What components use: `bg`, `text`, `accent`, `errorBg`, … | `theme.color.textMuted` |

Components read **semantic** tokens plus the spacing, radius, type, and shadow scales, never a primitive color. The accent alias makes accents cheap: semantic tokens say `{accent.600}` (light) or `{accent.400}` (dark), and each build swaps which scale `accent` points at.

## Palette

A blue-charcoal neutral (`ink`) with Care blue (default), Plum, and Sea glass accents. Accents change primary actions, links, selection, focus rings, and the `accent` Badge only. Coral (error), gold (warning), green (success), and info blue are fixed across themes, and every status carries a text label, so meaning never relies on hue alone.

| Step | `ink` | `care` (default) | `plum` | `seaGlass` |
|------|-------|------------------|--------|------------|
| 0 | `#FFFFFF` | | | |
| 25 | `#FCFCFB` | | | |
| 50 | `#F6F7F7` | | | |
| 100 | `#ECEFEF` | | | |
| 200 | `#DCE1E2` | `#B7E2F2` | `#E2CDE8` | `#B8E2DB` |
| 300 | `#C3CCCE` | `#7CCAE4` | `#C9AAD3` | `#86CCC0` |
| 400 | `#95A3A7` | `#43ADD4` | `#B58BC3` | `#55B3A3` |
| 500 | `#5E6F74` | `#168CB8` | `#9366A3` | `#379484` |
| 600 | `#506166` | `#0C6F96` | `#784B88` | `#287767` |
| 700 | `#405057` | `#0A5878` | `#623B70` | `#205F53` |
| 800 | `#303E44` | `#08435C` | `#4D2E59` | `#194A41` |
| 900 | `#223137` | | | |
| 950 | `#152126` | | | |

Care blue's `600` is dark enough for white button text to reach 4.5:1.

| Status | Light fg | Light bg | Dark fg | Dark bg |
|---|---|---|---|---|
| success | `#247563` | `#E2F4F0` | `#65C5B2` | `#17302B` |
| warning | `#805600` | `#FFF1CC` | `#F2BD4A` | `#302510` |
| error | `#B43C52` | `#FBE8EC` | `#F08092` | `#35171E` |
| info | `#0C6F96` | `#E2F2F8` | `#65BCDB` | `#122B35` |

## Semantic mapping

| Token | Light | Dark |
|-------|-------|------|
| `bg` / `surface` | `ink.50` / `ink.0` | `ink.950` / `ink.900` |
| `bgSubtle` / `bgSubtleHover` | `ink.100` / `ink.200` | `ink.800` / `ink.700` |
| `text` / `textMuted` | `ink.900` / `ink.600` | `ink.50` / `ink.300` |
| `textSubtle` / `textPlaceholder` | `ink.500` | `ink.400` |
| `textInverse` | `ink.0` | `ink.950` |
| `border` / `borderStrong` | `ink.200` / `ink.300` | `ink.800` / `ink.700` |
| `accent` / `accentHover` / `accentActive` | accent `600` / `700` / `800` | accent `400` / `300` / `200` |
| `accentFg` | `ink.0` | `ink.950` |
| `borderFocus` | accent `500` | accent `400` |
| `overlay` | `rgba(21, 33, 38, 0.5)` | `rgba(0, 0, 0, 0.6)` |

The accent flips in dark mode because a mid-tone that reads on white is too dark on near-black. The semantic name stays the same while the primitive changes; that is what the semantic tier is for.

## Contrast gate

`scripts/check-contrast.mjs` checks 32 pairs in each of the 6 themes (192 checks) and **fails the token build** on any miss: text on backgrounds (4.5), accent as text (4.5), text on accent fills (4.5), status on its fill and on backgrounds (4.5), Button danger and secondary-pressed text (4.5), and placeholder, focus ring, and input border (3.0). The lowest text pair is dark Plum `accent` on `surface` at 4.77.

**Rule:** `textSubtle` is never placed on `bgSubtle` (4.35 in light). Use `textMuted` there.

| Command | What it does |
|---------|--------------|
| `npm run tokens` | Build and check |
| `npm run tokens:self-test` | Makes light `textMuted` too light and passes only if the check catches it |

## Scales (theme-independent)

```ts
spacing:    { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64 }
size:       { touchTarget: 44 }
radius:     { none: 0, sm: 4, md: 8, lg: 12, xl: 16, full: 9999 }
fontSize:   { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30 }
fontWeight: { regular: '400', medium: '500', semibold: '600', bold: '700' }
lineHeight: { tight: 1.25, normal: 1.5 }
opacity:    { disabled: 0.4, pressed: 0.85 }
shadow:     { sm, md, lg }
```

The font is the platform system font, so there are no font files to load or license.

## Build output

All in `src/design-system/tokens/generated/`, committed, never hand-edited.

| File | Contents |
|------|----------|
| `base.ts` | The scales above |
| `light.ts`, `dark.ts` | Semantic colors with the default accent |
| `accents.ts` | Per accent × scheme, only the colors that differ from Care blue |
| `palette.ts` | Primitive colors, for the design system screen only |
| `index.ts` | `ColorTokens`, `Scheme`, `schemes`, typed overrides |
| `tokens.css` | CSS variables: `:root`, `[data-theme="dark"]`, `[data-accent="…"]` |
| `themes.json` | All 6 color sets, flat, read by `check-contrast` |

Transforms in `scripts/build-tokens.mjs`:

| Source | Problem in React Native | Output |
|--------|-------------------------|--------|
| `"16px"` | RN sizes are unitless | `16` |
| Font weight `600` | RN wants a string literal | `'600'` |
| Line height `1.5` | RN `lineHeight` is absolute | Kept as a multiplier; `Text` computes `fontSize × lineHeight` |
| DTCG shadow object | Older RN needed separate platform props | A CSS `boxShadow` string, which RN 0.76+ (New Architecture) and react-native-web accept |

## Type safety

- `ColorTokens` is derived from `light.color`, and `schemes` is `Record<Scheme, { color: ColorTokens }>`, so **a key missing from `dark` is a compile error**.
- Accent overrides are `Record<Accent, Record<Scheme, Partial<ColorTokens>>>`: every accent covers both schemes and can only override real tokens.
- `Theme = typeof base & { scheme; accent; color: ColorTokens }`. Scales keep literal types, so `t.fontWeight.semibold` is `'600'`, not `string`.
- Shared unions (`Size`, `ButtonVariant`, `StatusVariant`, `CardVariant`, `CardPadding`, `TextVariant`, `TextTone`, `ColorSchemePreference`) live in `src/design-system/types.ts`.

## Using the theme

```tsx
import { makeStyles } from '@/design-system';

export function Example() {
  const styles = useStyles();
  return <View style={styles.box} />;
}

const useStyles = makeStyles((t) => ({
  box: {
    backgroundColor: t.color.surface,
    padding: t.spacing[4],
    borderRadius: t.radius.lg,
    boxShadow: t.shadow.sm,
  },
}));
```

`makeStyles` declares styles once, outside the component, and rebuilds the `StyleSheet` only when the theme changes. Use `useTheme()` directly only for a value outside a style, such as the status bar style. Store access goes through the typed hooks in `src/store/hooks.ts`.

| Task | Steps |
|------|-------|
| Change a color | Edit `tokens/primitive/color.json`, then `npm run tokens`. A contrast failure names the pair |
| Add a semantic token | Add it to **both** `semantic/light.json` and `dark.json`, then `npm run tokens`. Missing from one is a typecheck error |
| Add an accent | Add the scale to `color.json`, add `tokens/accent/{name}.json`, add the name to `ACCENTS` in `build-tokens.mjs`, then `npm run tokens` |
| Add a scale step | Edit `tokens/primitive/scale.json`, then `npm run tokens` |

## Components

Components live in `src/design-system/components/`, written so they could be extracted into a package. How screens compose them is in [DESIGN.md](../DESIGN.md).

1. **Spec first.** Each component has a spec in [specs/components/](specs/components/); the code and E2E assertions follow it.
2. **Shared types.** Variant and size unions live in `types.ts` and are reused: `Size = 'sm' | 'md' | 'lg'`, `ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'`, `StatusVariant = 'default' | 'accent' | 'success' | 'error' | 'warning' | 'info'`, `CardVariant`, and `CardPadding`.
3. **Tokens only.** Styles come from `useTheme()` and `makeStyles`. No literals and no inline styles.
4. **Variants over overrides.** No `style` prop that restyles internals. The only escape hatch is a `containerStyle` limited to margin and flex, where the spec allows it.
5. **Accessible by default.** Correct `accessibilityRole`, labels on icon-only controls, `aria-*` state for disabled and busy, and a 44×44 minimum hit area.
6. **Every component takes a `testID`** on its root, which E2E finds as `data-testid` on web.
7. **Built on RN primitives** (`Pressable`, `Text`, `TextInput`, `View`); a complex component may use `@rn-primitives` ([ADR 0003](decisions/0003-own-components-on-rn-primitives.md)).

Each component is a folder with `Component.tsx` and `index.ts`, exported from `src/design-system/index.ts`. Features import from `@/design-system`, never from a component's folder.

| Component | Built on | Spec |
|-----------|----------|------|
| Text | RN `Text` | [text.md](specs/components/text.md) |
| Button | `Pressable` | [button.md](specs/components/button.md) |
| Card | `View` / `Pressable` | [card.md](specs/components/card.md) |
| Badge | `View` + `Text` | [badge.md](specs/components/badge.md) |
| Input | `TextInput` | [input.md](specs/components/input.md) |

## Tests

| Test | Checks |
|------|--------|
| `e2e/theme.spec.ts` | Dark toggle changes the background and carries across screens; `system` follows the device; accent choice is checked (`aria-checked`) and recolors the chip |
| `e2e/design-system.spec.ts` | Every component, variant, and size renders with its `testID` |
| `npm run typecheck` | Theme completeness |
| `npm run tokens` | Contrast |
