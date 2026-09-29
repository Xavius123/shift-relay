# Requirements

Shift Relay is a small React Native app. It stays compact on purpose: few screens, each built properly.

## Goals

| # | Requirement | Where it is met |
|---|-------------|-----------------|
| R1 | Functional React Native app, **entirely TypeScript** | Expo + strict `tsconfig`, no `.js` source files |
| R2 | **Clean, readable, type-safe code**, good component structure | Feature folders, the design-system component layer, typed hooks, lint ([architecture.md](architecture.md)) |
| R3 | **Basic error handling** | RTK Query error states with retry and simulate-failure switch; root error boundary |
| R4 | **AI-assisted development** that stays reviewable | Spec → implement → verify loop, skills in `.claude/skills/`, [AI.md](../AI.md) |
| R5 | **Redux** or similar global state | Redux Toolkit + RTK Query |

## Running and reviewing

| Need | Where |
|------|-------|
| Run it on web or a device | Web in the browser, and on an iPhone in Expo Go ([setup.md](setup.md)) |
| Understand the code and design choices | [architecture.md](architecture.md) and the ADRs in [decisions/](decisions/) |
| See challenges, solutions, and learnings | The "Challenges" section in [AI.md](../AI.md) |
| Install from a fresh clone | `npm install`, then `npm run web` |

## Suggested walkthrough (about 5 minutes)

1. **Design system screen**: toggle dark mode and switch accent. The whole app re-themes from tokens.
2. **Dashboard → choose shift → sign off with an issue → resolve the issue**: Redux session state, RTK Query caching, and mutations.
3. **Simulate failure → retry → recovers with stale content preserved**: error handling without a crash.
4. **AI workflow**: open a spec, its component, and its test side by side. Run `/new-component`, or see lint catch a hard-coded color.
