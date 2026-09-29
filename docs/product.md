# Product

Shift Relay is a three-phase operational log for field teams that review, hand off, and close work every day. Field teams need a durable way to pass unfinished or completed work between shifts, and the app turns that into a focused mobile flow. It is also a compact demonstration of TypeScript, Redux, error handling, design-system engineering, and an evidence-based AI development workflow. Data and accounts are fictional.

## Goals

| # | Goal | Where it is met |
|---|------|-----------------|
| R1 | Functional React Native app, entirely TypeScript | Expo, strict `tsconfig`, no `.js` source files |
| R2 | Clean, readable, type-safe code with good component structure | Feature folders, the design-system layer, typed hooks, lint ([architecture.md](architecture.md)) |
| R3 | Basic error handling | RTK Query error states with retry, a simulate-failure switch, a root error boundary |
| R4 | AI-assisted development that stays reviewable | Spec → implement → verify loop, skills in `.claude/skills/`, [AI.md](../AI.md) |
| R5 | Redux or similar global state | Redux Toolkit + RTK Query |

## Users and daily flow

Jordan is the Morning Shift Manager, Avery is the Night Shift Manager, and Elena is an Operations Manager who observes their work.

1. **Dashboard:** today's Morning, Midday, and Night Daily Sheet. Jordan and Avery see their next action. Elena sees this week's metrics and all open issues.
2. **Logs:** today and 21 complete prior operational days, grouped by date. A log opens in a shared modal over the current section.
3. **Shift log:** one required restock check with history, an optional note, sign-offs, linked issues, and Shift Photos. Jordan signs Morning and sends Midday; Avery reviews open issues, receives Midday, and signs Night.
4. **Issues:** Shift Managers can flag and resolve multiple high-priority issues per log, or flag one from the Issues tab. Open issues stay visible until resolved; resolved issues remain in history.
5. **Shift Photos:** each shift can save reviewed photos. Every account can view saved photos; only Elena can delete one. Historical examples are generated drawings, including a mouse on duty.
6. **Design system:** token-driven themes, reusable components, and a failure simulator for development.

Behavior in detail: [shift logging](specs/shift-logging.md), [issues](specs/issues.md), and [issue photos and the Daily Report](specs/issue-photos.md).

## Sign-in

Sign-in is a demo gate, not authentication: three one-tap fictional accounts, no passwords, no backend.

- A fresh session is signed out and shows only the sign-in gate (brand, theme toggle, the three accounts). Nothing else is reachable until an account is chosen.
- Every sign-in lands on the Dashboard, including after a deep link such as `/logs`.
- Once signed in, every section header shows **Sign out** next to the theme toggle; signing out returns to the gate on the same URL.
- The Sign in screen still shows the active account, so switching accounts takes one tap.
- Jordan initiates the Midday handoff; Avery receives it with a second sign-off. There is no Midday account; Midday is the handoff event between Morning and Night.
- Elena can inspect the Dashboard and Logs and add photos to any of the day's open shifts, but cannot sign logs, raise issues, or resolve them.
- Reloading resets the session. `sessionSlice` stores only the selected account ID or `null`.
- Account buttons are labeled, at least 44×44, and the active role is stated in words, never by color alone.

## Technical direction

| Decision | Direction |
|----------|-----------|
| Runtime | Expo SDK 57, React Native 0.86, React 19.2, strict TypeScript |
| Targets | Web and iOS; Playwright on web and a manual Expo Go check on iPhone ([ADR 0007](decisions/0007-web-and-ios-targets-playwright-e2e.md)) |
| Navigation | Expo Router with a desktop side rail, mobile tabs, and a drawer |
| State | RTK Query for logs and issues; Redux slices for session, theme, filters, dev controls, and unsaved photo drafts. Query data is never copied into a slice |
| Design system | Repository-owned DTCG tokens, Style Dictionary output, typed components ([design-system.md](design-system.md)) |
| Data | An in-memory mock API resets on restart; photos stay on the device and are never uploaded |

## Scope

One operational site is assumed. Authentication, multiple sites, notifications, GPS, offline synchronization, cloud storage, and a production backend are out of scope. Architecture decisions live in [decisions/](decisions/).
