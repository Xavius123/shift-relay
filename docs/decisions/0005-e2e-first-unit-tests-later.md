# 0005 — E2E first; unit tests later

Status: Accepted · 2026-09-21 · Target details in [0007](0007-web-and-ios-targets-playwright-e2e.md)

## Context
One week. Components and slices change shape early on. Tests written against moving parts get rewritten.

## Decision
- Every verify run covers typecheck, lint, and Playwright E2E flows against the Expo web build.
- Jest + React Native Testing Library unit tests start once the parts are stable.

## Consequences
- The app is verified running from day one. Launch or crash bugs cannot hide behind green unit tests.
- Unit coverage arrives late, so slice logic is checked only through E2E until then. Accepted for the timeline.
- iOS behavior is checked with a dated manual flow on a real iPhone ([testing.md](../testing.md)).
