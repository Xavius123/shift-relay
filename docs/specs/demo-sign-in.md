# Required demo sign in

Status: built · 2026-09-28 (sign-in required since 2026-09-28)

## Outcome

Reviewers can choose a fictional Shift Manager or Manager identity from a top-level Sign In screen. Shift Managers provide named operational sign-offs; the Manager observes operational records without signing them. A dedicated weekly overview remains proposed.

## Behavior

- A fresh app session is signed out and shows only the sign-in gate: brand, theme toggle, and the three demo accounts. No navigation or screens are reachable until an account is chosen.
- Every sign-in lands on the Dashboard, including after a deep link (e.g. `/logs`).
- Once signed in, every section header shows **Sign out** at the top right, next to the theme toggle. Signing out returns to the gate on the same URL.
- The navigation is unchanged once signed in, including the Sign in tab for switching accounts.
- Jordan Lee is the Morning Shift Manager and initiates the Midday handoff.
- Avery Smith is the Night Shift Manager and receives the Midday handoff with its second sign-off.
- Elena Ruiz is the Operations Manager. She can inspect Dashboard and Logs but cannot sign logs or complete urgent issues.
- There is no Midday Shift Manager account; Midday describes the handoff event between Morning and Night.
- The active role and fictional name remain visible when returning to Sign In during the same running session.
- Selecting the other role switches immediately.
- Sign Out clears the demo session.
- Reloading the app resets the demo session; persistence is deferred.

## State ownership

`sessionSlice` stores only the selected demo account ID or `null`. It is local UI/session state, not server data. The role union is `shiftManager | manager`; names and descriptions are fixed fictional demo content.

## Accessibility

- Account actions are labeled buttons with 44×44 minimum targets.
- The active role is labeled in words and its button is disabled.
- Color does not carry role or session state by itself.

## Non-goals

- Passwords, email fields, validation, or account creation
- Authentication providers or a backend
- Production authentication or authorization (the gate is a demo UI guard only)
- Session persistence or token storage
