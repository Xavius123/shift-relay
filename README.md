# Shift Relay

A small React Native app for handing work from one field shift to the next. It is built with TypeScript, Redux Toolkit, RTK Query, and its own design system.

Shift Relay is fully runnable from a fresh clone: it needs no backend, accounts, or API keys, and all data is fictional. Web and iOS (Expo Go) are supported.

## What it shows

| Area | How |
|------|-----|
| React Native + TypeScript | Expo, strict TypeScript, no `any` |
| Code quality | Feature folders, typed hooks, explicit loading / empty / error states, lint rules that enforce the design system |
| Redux | Redux Toolkit for UI state, RTK Query for data |
| Design system | An original palette as W3C DTCG tokens → Style Dictionary → typed React Native theme + CSS, light/dark, contrast checked at build time |
| AI in development | Specs first, Claude Code skills and rules in the repo, a verify gate on every change, and an honest log in [AI.md](AI.md) |

## Built with AI

This app was built with a combination of **Cursor**, **Claude** (Opus and Sonnet), and **Codex** (Sol). What keeps that work reviewable rather than magic:

- **Rules in the repo.** [AGENTS.md](AGENTS.md) is the one rule file every tool reads (strict types, tokens only, typed hooks, states on every screen); [CLAUDE.md](CLAUDE.md) imports it.
- **Spec before code.** Components and features start as a spec in [docs/specs/](docs/specs/).
- **A gate, not trust.** Typecheck, lint, format, a contrast check on the palette, and Playwright E2E run against AI output the same way they run against hand-written code.
- **An honest log.** [AI.md](AI.md) records what AI did, what had to be corrected, and where it was wrong, including the mistakes the gate caught.

## Screens

1. **Sign in**: three one-tap demo accounts: Jordan Lee (Morning Shift Manager), Avery Smith (Night Shift Manager), and Elena Ruiz (Operations Manager)
2. **Dashboard**: today's Daily Sheet (Morning → Midday handoff → Night), the account's next action, and open high-priority issues. For Elena, this week's handoff and issue numbers sit above the Daily Sheet and the full open-issue list below it
3. **Shift sheet** (a modal over Dashboard or Logs): Shift Photos at the top (take or choose, review, save) with a camera bar pinned to the bottom, one required restock check, issues, note, and sign-off
4. **Logs**: today and 21 complete operational days, grouped by date, with search and sorting
5. **Issues**: flag, resolve, and filter high-priority issues
6. **Shift Photos** (every account): each day's saved photos, newest first, split into Morning, Midday, and Night, with a placeholder only where today's shifts have none yet (every finished shift has one or two fictional drawings, including a mouse on duty); tap one to view it full size, or open the sheet it came from. Only Elena can delete a saved photo
7. **Design system**: light/dark themes, selectable accents, components, and the simulated-failure control

Everyone who signs, checks, raises, resolves, or photographs something shows as initials beside it.

## Walkthrough

A suggested path through the app:

1. Sign in as **Jordan**. On the Dashboard, tap **Complete Morning**.
2. Take a photo, either way: the center **camera** tab on a phone (it opens the camera, then the form), or **Take photo** / **Library** in the bar pinned to the bottom of the sheet (camera on iPhone, file picker on web). Review the photos, remove any you don't want, and **Save**. Signing off is blocked while photos are unsaved; once saved, Jordan can't delete them.
3. Tick the restock check and sign off. Open the Midday handoff, flag an issue, and send it.
4. Switch to **Avery**. Review the open issue, receive the handoff, and complete Night.
5. Switch to **Elena**. Her Dashboard shows this week's numbers and every open issue. **Shift Photos** shows today's Morning photo; tap it to preview, and delete it if it shouldn't be on the record. The sheets are read-only for her.

## Data and photos

There is no backend. A mock RTK Query API serves generated, fictional data from memory, so every device has its own copy and a restart restores the seed. Shift photos are held the same way: the image stays on the device, and the log stores its local URI. Historical shift photos are fictional drawings generated in this repo; no real place is shown.

## Docs

| Doc | What it covers |
|-----|----------------|
| [DESIGN.md](DESIGN.md) | How screens use the design system: tokens, spacing, state patterns |
| [docs/background.md](docs/background.md) | Product rationale and current technical direction |
| [docs/requirements.md](docs/requirements.md) | Project goals and where each is met |
| [docs/setup.md](docs/setup.md) | Machine setup: Node, Playwright, Expo Go on the iPhone |
| [docs/architecture.md](docs/architecture.md) | Folders, state, data flow, theming |
| [docs/design-system/theming.md](docs/design-system/theming.md) | How tokens, the theme, and the Redux store fit together; how to use and change them |
| [docs/design-system/tokens.md](docs/design-system/tokens.md) | The palette, contrast results, and the React Native output |
| [docs/design-system/components.md](docs/design-system/components.md) | Component rules |
| [docs/specs/](docs/specs/) | One spec per component, written before the code |
| [docs/product.md](docs/product.md) | Current Shift Relay product flow and scope |
| [docs/data-model.md](docs/data-model.md) | Shift-log, issue, and photo types plus seed rules |
| [docs/testing.md](docs/testing.md) | E2E tests, with unit tests planned |
| [docs/decisions/](docs/decisions/) | Architecture decision records |
| [AI.md](AI.md) | How AI was used, including where it was wrong |

## Running it

**Stack:** Expo SDK 57 · React Native 0.86 · React 19.2 · TypeScript 6 (strict) · Expo Router.

**Targets:** web and iOS ([ADR 0007](docs/decisions/0007-web-and-ios-targets-playwright-e2e.md)).

**Prerequisites:** Node 20+, and [Expo Go](https://expo.dev/go) on an iPhone. Setup: [docs/setup.md](docs/setup.md).

**Camera:** `expo-image-picker`, which runs in Expo Go. iOS asks for camera access the first time; on web, the camera button opens the browser's file picker, and camera capture needs HTTPS or `localhost`.

### Quick start

```bash
npm install
npx playwright install chromium   # once: the browser for E2E
npm run doctor:env       # checks Node and Playwright
npm run web              # develop in the browser
npm start                # scan the QR code with the iPhone to open it in Expo Go
```

### Scripts

| Script | What it does |
|--------|--------------|
| `start` / `start:clear` | Expo dev server (`:clear` resets the Metro cache) |
| `web` | Dev server, opened in the browser |
| `start:tunnel` | Dev server over a tunnel, when the iPhone is not on the same Wi-Fi |
| `ios` | Dev server for an iOS Simulator on macOS; this project is checked on a real iPhone through Expo Go |
| `typecheck` | `tsc --noEmit`, strict |
| `lint` / `lint:fix` | ESLint (Expo config + Prettier) |
| `format` / `format:check` | Prettier write / check |
| `check` | typecheck + lint + format check, the local quality gate |
| `e2e` / `e2e:smoke` / `e2e:ui` | All Playwright specs / just the smoke spec / the Playwright UI |
| `doctor` | `expo-doctor`: dependency and config health |
| `npx expo export --platform web` | Production web build into `dist/` |
| `doctor:env` | Machine setup check (Node, Playwright, Chromium) |
| `tokens` / `tokens:self-test` | Build tokens and check contrast / prove the contrast check fails on a bad color |
