# 0008 — Responsive app shell: side nav on wide screens, tabs and drawer on phones

Status: Accepted · 2026-09-22

## Context
The app had one stack and links between screens. It targets web (wide screens) and iOS (phones) ([ADR 0007](0007-web-and-ios-targets-playwright-e2e.md)). A single stack reads well on neither: on a desktop browser there is no persistent navigation, and on a phone the sections aren't one tap away.

## Decision
- **Four top-level sections:** Dashboard (`/`), Logs (`/logs`; log records open in a modal, and `/logs/[id]` was retired), Design system (`/design-system`), Sign in (`/sign-in`), plus a Manager-only Overview (`/overview`).
- **Expo Router's headless tabs** (`expo-router/ui`: `Tabs`, `TabList`, `TabTrigger`, `TabSlot`) define them once. `AppShell` draws the same `TabList` two ways by width:
  - `≥ breakpoint.wide` (768): a side nav (`size.sidebar`, 240) left of the content.
  - below: bottom tabs under the content plus a modal drawer opened by a hamburger on section-root headers. The drawer presents the fuller labeled side navigation, overlays content, respects safe areas, and closes after navigation, on scrim press, or on Escape on web.
- **Each section has its own `Stack`**, so a section keeps its history (Logs → shift log → Back) and gets a themed header with the page title and a light/dark toggle.
- Detail screens retain the platform Back control and do not show the hamburger.
- New tokens: `breakpoint.wide`, `size.sidebar`, `size.content`. Icons: `@expo/vector-icons` (Ionicons, bundled in Expo Go).

## Consequences
- No new navigation or component library. The drawer is local shell UI built from React Native primitives, existing semantic tokens, headless tabs, and Ionicons, all of which already run in Expo Go.
- `TabList` must be a direct child of `Tabs`, and each `TabTrigger` a direct child of `TabList`, or Expo Router doesn't see the routes. So both lists are written inline in `AppShell`, not as separate components.
- `TabList` lays its children out in a row by default; the side nav sets `flexDirection: 'column'`. (Found by a failing E2E test: the side nav buttons rendered under the content.)
- Phone bottom tabs remain the fastest path between the three primary sections. The drawer intentionally repeats those destinations in the fuller labeled side-navigation treatment requested for the shell.
- Rejected: `@react-navigation/drawer` (extra dependency and navigator complexity for three existing tab routes); stock `Tabs` from `expo-router` alone (bottom tabs only, no responsive side layout or drawer).
