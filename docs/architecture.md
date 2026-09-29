# Architecture

## Folders

```text
src/
  app/              Thin Expo Router routes
  design-system/    Tokens, theme, shared types, and components
  features/
    auth/           Demo accounts and session
    camera/         Shared photo picker
    common/         Screen states, initials, and shared formatting
    dev/            Failure simulation and mock latency
    issues/         Issue form, list, categories, permissions
    logs/           Mock API, seed, Daily Sheets, log modal, Shift Photos
    manager/        Weekly metrics and open issues on Elena's Dashboard
    reference/      Design system showcase
    settings/       Theme and filter UI state
    shell/          Responsive navigation and shared headers
  store/            Redux store and typed hooks
e2e/               Playwright browser flows
tokens/            Source tokens; generated output lives in src/design-system/tokens/generated/
scripts/           Token, seed-photo, typed-route, and environment tools
```

Routes live in `src/app/`; `@/*` maps to `src/*`. The intended dependency direction is app → features → design system. The design system receives theme values through its provider and does not import feature data.

## State and data flow

| Kind | Owner | Examples |
| --- | --- | --- |
| Mock server data | RTK Query and `logsApi` | Logs, issues, mutations |
| UI state | Redux slices | Demo account, theme, issue filter, unsaved shift-photo drafts |
| Development controls | `devSlice` | Simulated failure; mock latency (fixed) |
| Short form state | Component state | Note, raise-issue draft, selected modal log |

The mock base query serves fictional logs and issues from memory, with optional simulated latency or failure. Mutations update that source and RTK Query caches. A restart restores today's pending logs and 21 completed historical days. Screens derive Daily Sheet status, open issues, and manager metrics from query data rather than copying results into slices. Saved shift photos are local URIs; seeded historical images are generated drawings.

## Theming

Style Dictionary builds typed theme tokens and CSS from `tokens/`. The contrast script validates the palette. `uiSlice` stores color scheme and accent; `AppThemeProvider` resolves them and exposes the theme through `useTheme()`. Components use `makeStyles()` with token values. Generated token files are not edited by hand.

## Navigation and errors

Expo Router provides typed routes. `AppShell` uses headless tabs with wide side navigation and narrow bottom tabs; a drawer gives narrow screens access to all sections. The center bottom-tab button is a camera (`ShiftCaptureButton`), not a route: it opens the camera for the signed-in Shift Manager's first open form, then that form with the photo waiting to be saved. Each section has a shared themed stack header. Sign-in gates the shell. The log detail is a shared modal over Dashboard, Logs, or Issues, so closing it returns to the originating section.

Queries show loading, error with Retry, and stale-data warnings where data is cached. Failed mutations keep the relevant draft visible. A root render error boundary catches render errors.

`npm run typecheck` first runs `scripts/typed-routes.mjs` to regenerate `.expo/types/router.d.ts` from `src/app`. The installed Expo route watcher can include unrelated files on Windows because it checks for `../` while Windows paths use `..\\`.
