# Testing

## Strategy

| When | What | Why |
|------|------|-----|
| **Every change** | `typecheck`, `lint`, Playwright E2E on the web build, and a manual check on the iPhone | Test what the user sees from the start. Catch "it compiles but doesn't launch" early |
| **Planned** | Jest + React Native Testing Library unit tests | Added once components and slices are stable, so tests aren't rewritten every time the design moves |

Interview line: *E2E from day one because that is what the user sees; unit tests once the parts stopped churning.*

## E2E (Playwright, web)

Flows, all kept green:

| Flow | Checks |
|------|--------|
| `e2e/smoke.spec.ts` | App loads; all three screens render |
| `e2e/theme.spec.ts` | Dark toggle changes the background |
| `e2e/design-system.spec.ts` | Every component `testID` is visible |
| `e2e/logging.spec.ts` | Sign in → choose shift → sign off with issue → complete issue; verify 21-day history |
| `e2e/sign-in.spec.ts`, `e2e/issues.spec.ts`, `e2e/walk-photos.spec.ts` | Demo sign-in, issue lifecycle, and Shift Photos |
| `e2e/shell.spec.ts`, `e2e/initials.spec.ts`, `e2e/manager-dashboard.spec.ts` | Responsive shell, initials attribution, and the manager Dashboard |
| `e2e/errors.spec.ts` | Simulated failure → raise-issue error shown, form kept, nothing added |

`npm run e2e` runs `playwright test`. It starts `expo start --web` on port 8081, or reuses a dev server that is already running. Every spec runs twice: a desktop Chrome viewport and a phone viewport. Specs find elements with `getByTestId`, because React Native Web renders `testID` as `data-testid` (see [components.md](design-system/components.md) rule 6). `npm run e2e:ui` opens the Playwright UI for debugging. First-time setup: `npx playwright install chromium`.

**What web E2E misses:** native-only behavior (shadows, `Pressable` feedback, safe areas, font metrics). The iPhone check below covers the demo paths. See [ADR 0007](decisions/0007-web-and-ios-targets-playwright-e2e.md).

### iPhone check (manual)

`npm start`, then scan the QR code with the iPhone camera to open Expo Go (same Wi-Fi; otherwise `npm run start:tunnel`).

- [ ] App launches without a red screen
- [ ] The changed flow done by hand, result noted with the date

Report it as **manual ✓ (date)** or **not done**, never as an automated pass.

## Unit tests (planned)

| Target | Cases |
|--------|-------|
| Log selectors / grouping | today phases, 21-day history, and open priority issues |
| `uiSlice` | toggle scheme, set accent |
| `mockBaseQuery` | query success; log sign-off and issue completion; `simulateFailure` returns an error; unknown id returns 404 |
| Contrast script | fails on a too-light color, passes on the real palette |
| Theme | light, dark, and each accent have every `ColorTokens` key |
| `Button` | renders label; `onPress` fires; not fired when disabled or loading |
| `Badge` | `max` overflow shows `{max}+` |

## `/verify`

Runs, in order: `typecheck` → `lint` → `format:check` → `e2e` → `test` (once set up), then records the iPhone check. Reports each as **pass**, **fail**, or **skipped (reason)**. A gate passes only when every required check passes.
