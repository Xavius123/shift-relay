# Shift Relay product specification

Shift Relay is a three-phase operational log for teams that review, hand off, and close work every day. The app demonstrates a React Native design system, Redux UI state, RTK Query server state, and an AI-assisted development workflow. Data and accounts are fictional.

## Users and daily flow

Jordan is the Morning Shift Manager, Avery is the Night Shift Manager, and Elena is an Operations Manager who observes their work. Sign-in is required to reach the app's sections, using one-tap demo accounts. This is a demo gate, not production authentication.

1. **Dashboard:** today's Morning, Midday, and Night Daily Sheet. Jordan and Avery see their next action. Elena sees this week's metrics and all open issues.
2. **Logs:** today and 21 complete prior operational days, grouped by date. A log opens in a shared modal over the current section.
3. **Shift log:** three required checks with history, an optional note, sign-offs, linked issues, and Shift Photos. Jordan signs Morning and sends Midday; Avery reviews open issues, receives Midday, and signs Night.
4. **Issues:** Shift Managers can flag and resolve multiple high-priority issues per log or flag an issue from the Issues tab. Open issues remain visible until resolved; resolved issues remain in history.
5. **Shift Photos:** each shift can save reviewed photos. Every account can view saved photos; only Elena can delete one. Historical examples are generated drawings, including a mouse on duty.
6. **Design system:** token-driven themes, reusable components, and a failure simulator for development.

See [shift logging](specs/shift-logging.md) and [issues](specs/issues.md) for current behavior. [Issue evidence photos and a Manager Daily Report](specs/issue-photos.md) are specified separately.

## State and scope

RTK Query owns logs, issues, and mock mutations. Redux slices own demo session, theme, filters, dev controls, and unsaved shift-photo drafts. Query data is never copied into a slice. The mock data resets on restart; photos stay on the device and are never uploaded.

The app targets web and iOS. Playwright checks web flows; Expo Go on a real iPhone is checked manually before release. One operational site is assumed. Production authentication, multiple sites, notifications, offline synchronization, and a backend are outside the demo.
