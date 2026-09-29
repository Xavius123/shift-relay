# Background and rationale

Shift Relay is a small React Native project prepared to demonstrate TypeScript, Redux, code quality, error handling, design-system engineering, and an evidence-based AI development workflow.

## Product choice

Field teams need a durable way to pass unfinished or completed work between shifts. Shift Relay turns that job into a focused mobile flow:

1. Dashboard for current workload and urgent items.
2. Logs history with Morning, Midday, and Night entries.
3. Log detail with required checks, optional high-priority issue, and sign-off.
4. Design-system reference with theme controls and failure simulation.

The scope is intentionally compact enough to remain demo-ready while still exercising server state, UI state, mutations, responsive navigation, loading/empty/error states, and accessibility.

## Technical direction

| Decision | Current direction |
|----------|-------------------|
| Runtime | Expo SDK 57, React Native 0.86, React 19.2, strict TypeScript |
| Targets | Web and iOS; Playwright on web and a manual Expo Go check on iPhone |
| Navigation | Expo Router with a desktop side rail and mobile tabs plus drawer |
| State | RTK Query for logs/issues; Redux slices for demo session, themes, and developer controls |
| Design system | Repository-owned DTCG tokens, Style Dictionary output, typed React Native components |
| Palette | Care blue by default, with Plum and Sea glass options; fixed semantic status colors |
| Verification | Typecheck, lint, formatting, contrast checks, Playwright, and a dated iPhone flow |

## Interview walkthrough

- Toggle light/dark mode and accents to show that the app is driven by typed tokens.
- Choose a shift, sign off its log with a high-priority issue, then complete that issue to show caching and mutations.
- Simulate a failure, retry, and recover without a white screen.
- Put a component spec, its implementation, and its E2E assertion side by side to show the AI-assisted spec → implement → verify loop.

## Deliberate boundaries

Camera proof, authentication, cloud storage, notifications, GPS, and a production backend are deferred. Architecture decisions live in [decisions/](decisions/).
