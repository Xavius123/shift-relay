# Requirements

The brief: a small React Native project to demo, walk through, and discuss in an interview. It does not need many screens.

## Must demonstrate

| # | Requirement | Where it is met |
|---|-------------|-----------------|
| R1 | Functional React Native app, **entirely TypeScript** | Expo + strict `tsconfig`, no `.js` source files |
| R2 | **Clean, readable, type-safe code**, good component structure | Feature folders, the design-system component layer, typed hooks, lint ([architecture.md](architecture.md)) |
| R3 | **Basic error handling** | RTK Query error states with retry and simulate-failure switch; root error boundary |
| R4 | **AI used in development** to work faster and cleaner | Spec → implement → verify loop, skills in `.claude/skills/`, [AI.md](../AI.md) |
| R5 | **Redux** or similar global state | Redux Toolkit + RTK Query |

## In the interview

| Ask | Prepared as |
|-----|-------------|
| **Demo** live on emulator/device | Web in the browser (easy to screen-share), plus the app running on an iPhone in Expo Go. Backup screen recording |
| **Walkthrough** of code, architecture, design choices | [architecture.md](architecture.md) and the ADRs in [decisions/](decisions/) |
| **Discuss** challenges, solutions, learnings | "Challenges" section in [AI.md](../AI.md), filled in as they happen |
| All dependencies installed | Fresh-clone install test |
| Public GitHub link shared in advance | Pushed and sent |

## Demo script (target: about 5 minutes)

1. **Design system screen**: toggle dark mode (and switch accent if built). The whole app re-themes from tokens.
2. **Dashboard → choose shift → sign off with issue → complete issue**: Redux session state, RTK Query caching, and mutations.
3. **Simulate failure → retry → recovers with stale content preserved**: error handling without a crash.
4. **AI workflow**: open a spec, its component, and its test side by side. Run `/new-component` or show the lint catching a hard-coded color.
