# 0007 — Web and iOS targets; Playwright for E2E

Status: Accepted · 2026-09-22 · Amends [0005](0005-e2e-first-unit-tests-later.md) (the E2E tool and target, not the timing)

## Context
The supported targets are web and iOS. Development runs on Windows with access to an iPhone but no Mac, so browser automation and a manual native check form the practical gate.

## Decision
- **Targets: web and iOS.** Develop on web (`npm run web`). Run iOS on a real iPhone through Expo Go (`npm start`, scan the QR code).
- **E2E: Playwright against the Expo web build**, in every verify run. Flows live in `e2e/*.spec.ts` and find elements by `testID`, which React Native Web renders as `data-testid`. Each flow runs at desktop size and at phone size.
- **iOS is a manual check** in each release check, dated, never reported as an automated pass.
- Web is the everyday way to run and show the app; the iPhone shows it running natively.

## Consequences
- The checks run on this machine with no emulator: `npm install` plus `npx playwright install chromium`.
- Web E2E does not catch native-only bugs (native shadows, `Pressable` feedback, safe areas, font metrics). The manual iPhone check covers the main flows only.
- Expo Go supports only the current SDK and the libraries bundled in it. A library that needs custom native code would need a development build through EAS, which needs an Apple developer account. Check Expo Go compatibility before adding one.
- Automated iOS E2E remains out of scope because it requires a Mac-based runner.
