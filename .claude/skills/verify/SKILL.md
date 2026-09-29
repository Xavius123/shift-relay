---
name: verify
description: >-
  Run the Shift Relay quality gate (typecheck, lint, Playwright E2E on web, and Jest once
  set up) and report each check as pass, fail, or skipped. Use when the user
  says /verify, check it, run the gate, is it green, or before calling any
  feature or component done.
---

# Verify — the gate

Run the checks in order and report every one. **Never report a check as passing if it did not run.**

## Checks

| # | Check | Command | Required |
|---|-------|---------|---------------|
| 1 | Types | `npm run typecheck` | yes |
| 2 | Lint | `npm run lint` | yes |
| 3 | Format | `npm run format:check` | yes |
| 4 | E2E | `npm run e2e` (Playwright against the Expo web build; starts the server if needed) | yes |
| 5 | Unit | `npm test -- --ci` | once set up |

Checks 1–3 together are `npm run check`, but run them one by one so the report shows each result. If E2E can't run, `npm run doctor:env` says which tool is missing; include its output in the report.

## Rules

- No `package.json` means the app is not scaffolded yet. Report every check as **skipped (no app yet)** and stop.
- A missing script is **skipped (script not defined)**. That is a finding, not a pass.
- E2E needs the Playwright browser. If it is missing, report **skipped (no browser)** and tell the human to run `npx playwright install chromium`.
- After the checks, list the iPhone check as **manual (ask the human)**. It is part of the release check, not of this report's automated result.
- Keep going after a failure so the report shows every check. The exception is when types fail so badly that lint output is noise; then say so.
- For failures, show the first relevant error lines, not the whole log.
- If Jest is not set up yet, report check 5 as **not required yet** instead of running it.

## Report

```
Verify
  typecheck  ✓ pass
  lint       ✗ fail   src/features/logs/LogsScreen.tsx:14  react-native/no-color-literals
  format     ✓ pass
  e2e        ✓ pass   2 specs × desktop, phone
  iphone     ? manual (ask the human)
  test       · not required yet
Gate: FAIL
```

The gate is **PASS** only when every required check passed.
