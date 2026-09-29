# Theming and state: how it fits together

An outline of the token pipeline, the theme, and the Redux store that drives it. For palette values and contrast results see [tokens.md](tokens.md); for which token to use where see [DESIGN.md](../../DESIGN.md).

## The flow

```
tokens/*.json ──npm run tokens──▶ generated/*.ts ──▶ createTheme(scheme, accent) ──▶ ThemeProvider ──▶ useTheme() / makeStyles()
                  │                                        ▲
                  └─▶ check-contrast (fails the build)      │
                                                  uiSlice { colorScheme, accent }  ◀── ThemeControls (dispatch)
                                                           │
                                                  AppThemeProvider resolves "system" from the device
```

1. **Source.** `tokens/` holds W3C DTCG JSON in three tiers.
2. **Build.** `npm run tokens` runs Style Dictionary once per scheme × accent (6 builds), writes the typed theme and `tokens.css`, then checks contrast.
3. **State.** `uiSlice` in Redux holds the user's choice: `colorScheme` (`system` / `light` / `dark`) and `accent`. A fresh session starts with Light and Care blue.
4. **Provide.** `AppThemeProvider` reads the slice, resolves `system` with `useColorScheme()`, and passes `scheme` and `accent` to the design system's `ThemeProvider`.
5. **Consume.** Components call `makeStyles((t) => …)` or `useTheme()`. A change in Redux re-themes the whole app, header included.

## Tokens: three tiers

| Tier | Files | Holds | Referenced as |
|------|-------|-------|---------------|
| Primitive | `tokens/primitive/color.json`, `scale.json` | `ink`, `care` / `plum` / `seaGlass`, status colors per theme; spacing, size, radius, type, opacity, shadow | `{ink.50}`, `{status.error.light.fg}` |
| Accent alias | `tokens/accent/{care,plum,seaGlass}.json` | Points `accent.200…800` at one accent scale | `{accent.600}` |
| Semantic | `tokens/semantic/{light,dark}.json` | What components use: `bg`, `text`, `accent`, `errorBg`, … | `theme.color.textMuted` |

The accent alias is what makes accents cheap. Semantic tokens say `{accent.600}` (light) or `{accent.400}` (dark), and each build swaps which scale `accent` points at. No semantic token is repeated per theme choice.

## Build output

All in `src/design-system/tokens/generated/`, committed, never hand-edited.

| File | Contents | Used by |
|------|----------|---------|
| `base.ts` | Scales: spacing, size, radius, fontSize, fontWeight, lineHeight, opacity, shadow | Every theme |
| `light.ts`, `dark.ts` | Semantic colors with the default accent (Care blue) | `createTheme` |
| `accents.ts` | Per accent × scheme, only the colors that differ from Care blue | `createTheme` |
| `palette.ts` | Primitive colors | The design system screen only |
| `index.ts` | `ColorTokens`, `Scheme`, `schemes`, typed overrides | The theme |
| `tokens.css` | CSS variables: `:root`, `[data-theme="dark"]`, `[data-accent="…"]` | Web consumers |
| `themes.json` | All 6 color sets, flat | `check-contrast` |

React Native transforms in `scripts/build-tokens.mjs`:

| Token type | Source | RN output |
|------------|--------|-----------|
| dimension | `"16px"` | `16` |
| fontWeight | `600` | `'600'` (RN wants a string literal) |
| shadow | DTCG object | `"0px 4px 8px -2px rgba(…)"` for RN's `boxShadow` (RN 0.76+, and web) |
| number | `1.5` | unchanged; lineHeight stays a multiplier |

## Type safety

- `ColorTokens` is derived from `light.color`. `index.ts` types `schemes` as `Record<Scheme, { color: ColorTokens }>`, so **a key missing from `dark` is a compile error**. Tried: deleting `textMuted` from `dark.ts` fails `npm run typecheck`.
- Accent overrides are typed `Record<Accent, Record<Scheme, Partial<ColorTokens>>>`: every accent must cover both schemes and can only override real tokens.
- `Theme = typeof base & { scheme; accent; color: ColorTokens }`. Scales keep their literal types, so `t.fontWeight.semibold` is `'600'`, not `string`.
- Shared unions (`Size`, `ButtonVariant`, `StatusVariant`, `CardVariant`, `CardPadding`, `TextVariant`, `TextTone`, `ColorSchemePreference`) live in `src/design-system/types.ts`.

## Contrast gate

`scripts/check-contrast.mjs` checks 32 pairs in each of the 6 themes (192 checks): text on backgrounds (4.5), accent as text (4.5), text on accent fills (4.5), status on its fill and on backgrounds (4.5), Button danger and secondary-pressed text (4.5), placeholder, focus ring, and input border (3.0). Any failure exits 1, so `npm run tokens` fails.

| Command | What it shows |
|---------|---------------|
| `npm run tokens` | Build + check. Lowest text pair today: dark Plum `accent` on `surface`, 4.77 |
| `npm run tokens:self-test` | Makes light `textMuted` too light (`ink.300`) and passes only if the check catches it |

## Redux

| Piece | File | Notes |
|-------|------|-------|
| Store | `src/store/store.ts` | `combineSlices(uiSlice)`; `RootState`, `AppDispatch`; `makeStore()` for tests |
| Typed hooks | `src/store/hooks.ts` | `useAppSelector`, `useAppDispatch` via `.withTypes()`. The only way to touch the store |
| `uiSlice` | `src/features/settings/uiSlice.ts` | `colorScheme`, `accent`; actions `setColorScheme`, `setAccent`; selectors `selectColorScheme`, `selectAccent` |

`sessionSlice`, `devSlice`, and RTK Query's `logsApi` share the same store. Server data never goes into a slice.

**Dependency direction holds:** `src/design-system/` never imports the store. `ThemeProvider` takes `scheme` and `accent` as props; `AppThemeProvider` in `features/settings` is the only bridge.

## Using the theme in a component

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

`makeStyles` declares styles once, outside the component; the hook rebuilds the `StyleSheet` only when the theme changes. Use `useTheme()` directly only when you need a value outside a style (for example the status bar style).

## Common changes

| Task | Steps |
|------|-------|
| Change a color | Edit `tokens/primitive/color.json` → `npm run tokens`. If contrast fails, the build says which pair |
| Add a semantic token | Add it to **both** `tokens/semantic/light.json` and `dark.json` → `npm run tokens`. Missing from one = typecheck error |
| Add an accent | Add the scale to `color.json`, add `tokens/accent/{name}.json`, add the name to `ACCENTS` in `build-tokens.mjs` → `npm run tokens`. The picker and types update from the generated `accentNames` |
| Add a scale step | Edit `tokens/primitive/scale.json` → `npm run tokens` |

## Tests

| Test | Checks |
|------|--------|
| `e2e/theme.spec.ts` | Dark toggle changes the background and carries across screens (Redux, not local state); `system` follows the device; accent choice is checked (`aria-checked`) and recolors the chip |
| `npm run typecheck` | Theme completeness (see Type safety) |
| `npm run tokens` | Contrast |
| Jest (planned) | `uiSlice` reducers and selectors, theme shape for every scheme × accent |
