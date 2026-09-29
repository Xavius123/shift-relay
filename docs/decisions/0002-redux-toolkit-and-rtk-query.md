# 0002 — Redux Toolkit + RTK Query with a mock base query

Status: Accepted · 2026-09-21

## Context
The brief asks for Redux or a similar global store. The app has server-shaped data (shift logs and priority issues) and UI state (demo session, color scheme, accent, dev flags).

## Decision
- Redux Toolkit slices for UI state only.
- RTK Query for data, via a `mockBaseQuery` that generates fictional logs, supports log sign-off and issue-completion mutations, adds latency, and fails on demand when `devSlice.simulateFailure` is on.
- Typed hooks (`useAppSelector`, `useAppDispatch`) only.

## Consequences
- Loading, caching, error, and retry come from RTK Query instead of hand-written thunks.
- The demo runs offline and fails deterministically on cue.
- Swapping to a real API means replacing the base query, not the components.
- Rejected: copying query results into slices (two sources of truth); Zustand (the brief names Redux).

Amended 2026-09-24 to identify shift logs and high-priority issues as the server-shaped domain.
