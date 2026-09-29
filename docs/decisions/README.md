# Architecture decision records

One file per decision: `NNNN-kebab-title.md`. Use `/adr {title}` to add one. A decision is changed by writing a new ADR that supersedes the old one, never by editing the old one's Decision section.

| # | Decision | Status |
|---|----------|--------|
| [0001](0001-expo-and-expo-router.md) | Expo + Expo Router | Accepted |
| [0002](0002-redux-toolkit-and-rtk-query.md) | Redux Toolkit + RTK Query with a mock base query | Accepted |
| [0003](0003-own-components-on-rn-primitives.md) | Own components on RN primitives; `@rn-primitives` only for complex ones | Accepted |
| 0004 | Not used; the number was skipped | n/a |
| [0005](0005-e2e-first-unit-tests-later.md) | E2E first; unit tests later | Accepted, E2E tool amended by 0007 |
| [0006](0006-own-palette-and-in-repo-token-pipeline.md) | Own palette and an in-repo token pipeline with a contrast gate | Accepted |
| [0007](0007-web-and-ios-targets-playwright-e2e.md) | Web and iOS targets; Playwright for E2E | Accepted |
| [0008](0008-responsive-app-shell.md) | Responsive app shell: side nav on wide screens, tabs and drawer on phones | Accepted |
| [0009](0009-issue-photos-in-the-mock-api.md) | Issue photos: expo-image-picker, URIs kept in the mock API | Accepted |
