# Tokens

How the pieces connect at runtime (theme, Redux, `makeStyles`): [theming.md](theming.md).

The company-adjacent color reset is specified in [palette.md](../specs/palette.md). The tables below describe the implemented baseline.

The design system's tokens live in this repo, in `tokens/`, as W3C DTCG JSON (`$type` / `$value`). Style Dictionary builds them into a typed React Native theme, plus a CSS file to prove the same source serves web ([ADR 0006](../decisions/0006-own-palette-and-in-repo-token-pipeline.md)).

## Tiers

| Tier | Folder | Holds | Example |
|------|--------|-------|---------|
| Primitive | `tokens/primitive/` | Raw scales: `ink` neutrals, accent scales, status colors, spacing, radius, type, shadow, opacity | `ink.600 = #506166`, `spacing.4 = 16` |
| Semantic | `tokens/semantic/` | What components use, per theme: `light.json`, `dark.json` | `color.textMuted → {ink.600}` |
| Accent | `tokens/accent/` | Accent overrides per accent × theme: `care` (default), `plum`, `seaGlass` | `color.accent → {care.600}` |

Components read **semantic** tokens plus the spacing, radius, type, and shadow scales. They never read a primitive color. Which token to use where is in [DESIGN.md](../../DESIGN.md).

## The palette

A blue-charcoal neutral (`ink`) with company-adjacent Care blue, Plum, and Sea glass accents. Coral, gold, completion green, and information blue remain fixed semantic colors; status badges include explicit labels so meaning never relies on hue alone.

### `ink` — neutrals

| Step | Hex | Step | Hex |
|------|-----|------|-----|
| 0 | `#FFFFFF` | 500 | `#5E6F74` |
| 25 | `#FCFCFB` | 600 | `#506166` |
| 50 | `#F6F7F7` | 700 | `#405057` |
| 100 | `#ECEFEF` | 800 | `#303E44` |
| 200 | `#DCE1E2` | 900 | `#223137` |
| 300 | `#C3CCCE` | 950 | `#152126` |
| 400 | `#95A3A7` | | |

### Accents

| Step | `care` (default) | `plum` | `seaGlass` |
|------|------------------|--------|------------|
| 200 | `#B7E2F2` | `#E2CDE8` | `#B8E2DB` |
| 300 | `#7CCAE4` | `#C9AAD3` | `#86CCC0` |
| 400 | `#43ADD4` | `#B58BC3` | `#55B3A3` |
| 500 | `#168CB8` | `#9366A3` | `#379484` |
| 600 | `#0C6F96` | `#784B88` | `#287767` |
| 700 | `#0A5878` | `#623B70` | `#205F53` |
| 800 | `#08435C` | `#4D2E59` | `#194A41` |

Care blue uses a darker `600` step so white button text remains accessible. Acknowledged and error states always include their words, icons, or actions as well as color.

### Status

| | Light fg | Light bg | Dark fg | Dark bg |
|---|---|---|---|---|
| success | `#247563` | `#E2F4F0` | `#65C5B2` | `#17302B` |
| warning | `#805600` | `#FFF1CC` | `#F2BD4A` | `#302510` |
| error | `#B43C52` | `#FBE8EC` | `#F08092` | `#35171E` |
| info | `#0C6F96` | `#E2F2F8` | `#65BCDB` | `#122B35` |

## Semantic mapping

| Token | Light | Dark |
|-------|-------|------|
| `bg` | `ink.50` | `ink.950` |
| `surface` | `ink.0` | `ink.900` |
| `bgSubtle` / `bgSubtleHover` | `ink.100` / `ink.200` | `ink.800` / `ink.700` |
| `text` | `ink.900` | `ink.50` |
| `textMuted` | `ink.600` | `ink.300` |
| `textSubtle` | `ink.500` | `ink.400` |
| `textPlaceholder` | `ink.500` | `ink.400` |
| `textInverse` | `ink.0` | `ink.950` |
| `border` / `borderStrong` | `ink.200` / `ink.300` | `ink.800` / `ink.700` |
| `accent` / `accentHover` / `accentActive` | accent `600` / `700` / `800` | accent `400` / `300` / `200` |
| `accentFg` | `ink.0` (white) | `ink.950` (near-black) |
| `borderFocus` | accent `500` | accent `400` |
| `overlay` | `rgba(21, 33, 38, 0.5)` | `rgba(0, 0, 0, 0.6)` |
| `success` … `infoBg` | status table | status table |

**Why the accent flips in dark mode:** a mid-tone accent that reads well on white is too dark on near-black. Dark mode uses the lighter `400` step with near-black text on top. The semantic name stays the same while the primitive changes. That is what the semantic tier is for.

## Contrast (verified 2026-09-23)

Every pair was computed with the WCAG 2.x contrast formula in both themes and for all three accents. **192 checks across six generated themes pass.**

| Pair | Minimum | Lowest measured |
|------|---------|-----------------|
| `text`, `textMuted`, `textSubtle` on `bg` / `surface` | 4.5 | passes |
| `text`, `textMuted` on `bgSubtle` | 4.5 | passes |
| `accent` as text on `bg` / `surface` | 4.5 | 4.77 (dark Plum on `surface`) |
| `accentFg` on `accent`, `accentHover`, `accentActive` | 4.5 | passes, all accents |
| Status fg on its status bg, and on `bg` / `surface` | 4.5 | passes |
| `textPlaceholder` on `bg` / `surface` | 3.0 | passes |
| `borderFocus` on `surface` (non-text) | 3.0 | passes |

**Rule:** `textSubtle` is never placed on `bgSubtle` (4.35 in light, below 4.5). Use `textMuted` there.

`scripts/check-contrast.mjs` reads the built tokens, checks every pair above in all six scheme × accent themes (192 checks), and **fails the token build** if any pair drops below its minimum. Palette edits can't quietly break accessibility.

## Scales (theme-independent)

```ts
spacing:    { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64 }
size:       { touchTarget: 44 }
radius:     { none: 0, sm: 4, md: 8, lg: 12, xl: 16, full: 9999 }
fontSize:   { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30 }
fontWeight: { regular: '400', medium: '500', semibold: '600', bold: '700' }
lineHeight: { tight: 1.25, normal: 1.5 }
opacity:    { disabled: 0.4, pressed: 0.85 }
shadow:     { sm, md, lg }   // authored as DTCG shadow objects
```

Font: the platform system font (SF Pro on iOS and the browser's system sans-serif on web). There are no custom font files to load or license.

## Output

```
tokens/ (DTCG JSON) ──Style Dictionary──▶ src/design-system/tokens/generated/
                                              base.ts      scales
                                              light.ts     semantic colors (Care blue)
                                              dark.ts      semantic colors (Care blue)
                                              accents.ts   per-accent overrides × theme (empty for Care blue)
                                              palette.ts   primitives, for the showcase only
                                              index.ts     ColorTokens type, schemes, exports
                                              tokens.css   CSS variables (web from the same source)
                                              themes.json  every scheme × accent, for check-contrast
                                          ──▶ check-contrast    fails the build on any bad pair
```

`npm run tokens` builds and checks. `npm run tokens:self-test` makes a color too light and passes only if the check catches it. Generated files are committed and carry a "generated — do not edit" header.

Accents are an alias tier: `tokens/accent/{name}.json` points `accent.200…800` at one accent scale, and the semantic files reference `{accent.600}`. The build runs once per scheme × accent.

CSS selectors: `:root` (light, Care blue, every token), `[data-theme="dark"]`, `[data-accent="plum"]`, and `[data-theme="dark"][data-accent="plum"]`, each carrying only what it changes.

### Shape

```ts
export const light = {
  scheme: 'light',
  color: { bg: '#F6F7F7', surface: '#FFFFFF', text: '#223137', accent: '#0C6F96', accentFg: '#FFFFFF' /* … */ },
} as const;

export type ColorTokens = { [K in keyof typeof light.color]: string };
export type Accent = 'care' | 'plum' | 'seaGlass';
export type Theme = typeof base & { scheme: 'light' | 'dark'; color: ColorTokens };
```

`dark` and each accent override must satisfy `ColorTokens`. A missing key is a compile error.

## React Native transforms (the interesting part)

| Source value | Problem in React Native | Transform |
|--------------|-------------------------|-----------|
| `"16px"` dimensions | RN sizes are unitless | Strip `px` → `16` |
| Font weight `600` | RN wants the string union `'100'…'900'` | Emit `'600'` as a literal type |
| Line height `1.5` (multiplier) | RN `lineHeight` is absolute | Keep the multiplier; `Text` computes `fontSize × lineHeight` |
| DTCG shadow `{ color, offsetX, offsetY, blur, spread }` | Older RN versions needed separate platform props | RN 0.76+ (New Architecture) and react-native-web accept a CSS `boxShadow` string, so emit `"0px 4px 8px -2px rgba(…)"` |
| `rgba()` overlay | Fine | Pass through |
| CSS output | Web wants kebab-case variables | `--dk-color-text-muted` etc. in `tokens.css` |
