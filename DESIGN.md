# Design

How screens in Shift Relay are put together with its design system. **Read this before building or changing any screen.** For how tokens are built and the component rules see [design-system.md](docs/design-system.md); for component props see the [specs](docs/specs/components/). This page does not repeat either.

## Principles

1. **Calm, dense, readable.** It is an operations tool: current status and next action first, little decoration, no gradients or illustrations.
2. **One accent.** The accent color marks the single most important action or state on a screen. Everything else is neutral.
3. **Meaning never relies on color alone.** Every colored badge or banner also says what it means in words.
4. **Every state is designed.** Loading, empty, error, and "stale data" look deliberate and consistent, never like a crash.
5. **Themes and accents are free.** Anything built from semantic tokens works in light, dark, and every accent with no extra code. If a screen needs a theme check (`scheme === 'dark'`), the token is wrong.

### Brand palette

Care blue is the default theme, with Plum and Sea glass as the only alternatives. Coral urgent/error, gold warning, and green completion colors stay fixed across themes. Palette values are in [design-system.md](docs/design-system.md#palette).

## Which token for what

| Use | Token |
|-----|-------|
| Screen background | `color.bg` |
| Card or grouped section | `color.surface` + `color.border` |
| Subtle fill (filter row, input bg on pressed) | `color.bgSubtle` → `color.bgSubtleHover` when pressed |
| Primary text | `color.text` |
| Secondary text (metadata, labels) | `color.textMuted` |
| Tertiary text (timestamps, hints) | `color.textSubtle` |
| The one primary action, selected filter, links | `color.accent` / `color.accentFg` |
| Destructive action, error message | `color.error` (text), `color.errorBg` (banner) |
| Warning or high-attention state | `color.warning` / `color.warningBg` |
| Success or completed state | `color.success` / `color.successBg` |
| Info banner | `color.info` / `color.infoBg` |
| Dividers | `color.border` |
| Modal scrim | `color.overlay` |

Primitive colors (`ink.*`, `care.*`, …) are never used in screens.

`textSubtle` is never placed on `bgSubtle` (fails contrast); use `textMuted` there. The contrast gate is described in [design-system.md](docs/design-system.md#contrast-gate).

## Spacing

Base unit 4. Use the spacing scale, never arbitrary numbers.

| Where | Token |
|-------|-------|
| Screen horizontal padding | `spacing.4` (16) |
| Screen top padding under header | `spacing.4` |
| Gap between cards in a list | `spacing.3` (12) |
| Card padding | Card `padding="md"` |
| Gap between items inside a card | `spacing.2` (8) |
| Gap between sections on a screen | `spacing.6` (24) |
| Label → value, icon → text | `spacing.1` (4) |

## Type

| Use | `Text` variant |
|-----|----------------|
| Screen title (one per screen) | `heading` |
| Section title, card title | `title` |
| Body, card description | `body` |
| Metadata row (type · score · date) | `bodySm`, tone `muted` |
| Captions, helper text, timestamps | `caption`, tone `subtle` |

All text goes through `Text`. No bare RN `<Text>` in features.

## App shell

Six sections: Dashboard, Logs, Issues, Shift Photos, Design system, and Sign in ([ADR 0008](docs/decisions/0008-responsive-app-shell.md), amended 2026-09-29). Design system and Sign in live only in the side nav and the phone drawer. The phone bottom tabs are Logs, Shift Photos, a center camera button, Issues, and Dashboard.

```
Wide (≥ breakpoint.wide, 768)                 Narrow (phones)
┌──────────┬────────────────────────────┐     ┌──────────────────────┐
│Shift Relay│ Header: title       ☾/☀   │     │ ☰ Header: title  ☾/☀ │
│          ├────────────────────────────┤     ├──────────────────────┤
│ ⌂ Dashboard│                           │     │                      │
│ ▤ Logs    │  Content, max size.content │     │  Content             │
│ ⚠ Issues  │  (880), centered           │     │                      │
│ ▣ Photos  │                            │     ├──────────────────────┤
│ 🎨 Design │                            │     │ ▤  ▣  [📷]  ⚠  ⌂     │  bottom tabs
└──────────┴────────────────────────────┘     └──────────────────────┘
 side nav: size.sidebar (240), surface + border
```

- On a narrow section-root screen, the header-leading hamburger opens the side navigation as a modal drawer. The drawer lists the same available sections as the wide side nav and closes after navigation, tapping the scrim, or pressing Escape on web.
- The narrow drawer covers the content instead of resizing it. It uses `color.overlay` for the scrim and a `color.surface` panel no wider than `size.sidebar`. Opening it does not change the current route.
- Narrow screens retain the persistent bottom tabs for quick switching; the hamburger provides access to the fuller labeled side navigation.
- The center bottom-tab button is a camera, not a section. For a Shift Manager it opens the camera for their first open form of the day (Jordan: Morning, then Midday; Avery: Midday, then Night), then opens that form with the photo waiting to review and save. With no open form it explains why and links to Shift Photos; it is never a disabled dead end.
- The current section is marked in words and state, not color alone: the wide side nav and narrow drawer fill the current row with `bgSubtle`; the bottom tabs swap to the filled icon; all presentations set `aria-selected`.
- The wide sidebar and narrow drawer share a compact Shift Relay mark, product name, and restrained workspace labeling; navigation remains the visual priority.
- Detail screens keep the platform Back control in the header instead of showing the hamburger.
- Each section is its own stack. Detail screens push inside their section and get a Back button.
- Page content is centered with `maxWidth: size.content`.
- The header theme toggle flips light / dark. Full scheme and accent controls live on the Design system screen.

## Screen anatomy

```
┌──────────────────────────────┐
│ Header: title · actions       │  Expo Router header
├──────────────────────────────┤
│ [Banner]                     │  only when stale/offline/error-with-data
│ Controls (search, filters)   │  sticky, spacing.4 padding
│ Content (list / detail)      │  spacing.4 horizontal, spacing.3 gaps
└──────────────────────────────┘
```

- Lists use `FlatList`, not `ScrollView` + `map`.
- Safe areas are respected on every screen.
- One primary Button per screen at most. Others are `secondary`, `outline`, or `ghost`.

## State patterns

Build these once in `src/features/common/` (or the design system) and reuse them on every screen. Never hand-roll a one-off.

| State | Looks like | Copy pattern |
|-------|------------|--------------|
| **Loading (first load)** | 3–5 placeholder cards the size of real ones (or a centered spinner until Skeleton exists) | none |
| **Empty** | Centered `title` + `body` muted + one action if there is one | "No high-priority issues." Say *why* it's empty |
| **Error (no data)** | Centered `title` + message + primary Retry | "Couldn't load shift logs." + the reason from `getErrorMessage` |
| **Error with cached data** | Keep the content; show a `warningBg` banner at the top with Retry | "Showing saved results. Refresh failed." |
| **Not found** | Same as Error, with a Back action instead of Retry | "This shift log doesn't exist." |
| **Refreshing** | Pull-to-refresh spinner only, content stays | none |

Error copy says what happened and what to do. No codes, no stack traces, no "Oops!".

## App-specific mappings

| Concept | Rendering |
|---------|-----------|
| Shift status pending / signed off | Badge `warning` / `success`, label in words |
| Required confirmation | Pressable row with checkbox semantics and `Check` / `Confirmed` Badge |
| High-priority issue open / complete | Badge `error` / `success`, label in words |
| Shift card | Card `interactive`: phase title, short purpose, and status badge |
| History | Date-grouped FlatList; Morning, Midday, and Night always appear in that order |
| Daily Sheet | One date card containing Morning, Handoff, and Night status plus one account-specific next action |
| Shift form | Shared modal over Dashboard or Logs; editable for the owning Shift Manager, read-only for signed records and Operations Manager |

## Motion

Keep it minimal: RN default navigation transitions and a pressed state on every pressable. No custom animations in v1.

## Accessibility checklist (every screen)

- [ ] Every pressable has a role and a label; touch targets are at least 44×44
- [ ] Screen title is a header (`Text` `heading`)
- [ ] Works at the largest system font size without clipped text
- [ ] Contrast holds in light and dark (semantic tokens are chosen for this; don't override)
- [ ] State changes (error, loaded) are announced or focus moves to them
