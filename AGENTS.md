# Agent instructions — Shift Relay

A React Native + TypeScript demo app built on its own small design system. This file is the single source of rules for any AI agent in this repo. `CLAUDE.md` imports it.

## How work happens

1. **Spec before code.** Components are built from [docs/specs/components/](docs/specs/components/). No spec means write the spec first and stop for review.
   Screens follow [DESIGN.md](DESIGN.md): token usage, spacing, state patterns. Read it before building or changing a screen.
2. **Verify before done.** Nothing is done until `/verify` passes. A skipped check is reported as skipped, never as passed.
3. **Log honestly.** Significant work adds an entry to [AI.md](AI.md): what AI did, what was corrected, and what was written by hand. Never invent a time saving or a correction.

## Code rules

- **TypeScript strict.** No `any`, no `@ts-ignore`, no non-null `!` without a comment saying why.
- **Tokens only.** No color literals, no raw spacing/radius/font-size numbers, no inline styles. Read everything from `useTheme()`.
- **Shared types.** Variant and size unions (`Size`, `ButtonVariant`, `StatusVariant`, …) live in `src/design-system/types.ts` and are reused, never redefined per component.
- **Where types live.** Route files in `src/app/` declare none. Domain types go in the feature's `types.ts` (`features/auth/types.ts`, `features/logs/types.ts`, …), never in a slice or component file that other files import from. A `Props` type used by one component stays beside it.
- **State.** Server data lives only in RTK Query. Slices hold UI state (filters, color scheme, accent, dev flags). Never copy query results into a slice.
- **Typed hooks only.** Use `useAppSelector` and `useAppDispatch`, never the raw `useSelector` and `useDispatch`.
- **Every screen has loading, empty, and error states.** Errors show a message and a retry. The app never white-screens; the error boundary catches the rest.
- **Accessibility.** Pressables have `accessibilityRole` and a label. Touch targets are at least 44×44.
- **Routes are thin.** `src/app/` files compose feature components. Logic lives in `src/features/`. Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.

## Tests

- **Targets:** web and iOS ([ADR 0007](docs/decisions/0007-web-and-ios-targets-playwright-e2e.md)). Develop on web; iOS runs on a real iPhone through Expo Go. Don't add a library that Expo Go can't run without an ADR.
- **E2E:** Playwright specs in `e2e/`, run against the Expo web build. Add or extend a spec with each feature.
- **Unit:** Jest + React Native Testing Library for slices, the theme, and key components are planned. Do not write Jest unit tests until they are set up.

## Dependencies

The app is on **Expo SDK 57** (React Native 0.86, React 19.2). A new library that shapes the architecture gets an ADR ([docs/decisions/](docs/decisions/)). Do not pin a version from memory. Check it.

**Expo changes every SDK release. Do not trust training data.** Before writing code that touches an Expo or React Native API, read the SDK version in `package.json` and check the matching docs at `https://docs.expo.dev/versions/v57.0.0/`, or start from `https://docs.expo.dev/llms.txt`.

```bash
npx expo install <package>   # ALWAYS, instead of npm install: picks the SDK-compatible version
npx expo install --fix       # fix incompatible versions
npx expo-doctor              # diagnose dependency and config issues
npm run web                  # day-to-day development in the browser
npm start                    # Expo Go on the iPhone: scan the QR code
npm run e2e                  # Playwright E2E (starts the web server if needed)
```

Native project directories are generated (Continuous Native Generation) and gitignored. Never create or edit them by hand; configure native behavior in `app.json` and config plugins.

## Do not

- Put real employee, customer, facility, or work-order data in this public repo. Fictional sample data only; see [docs/data-model.md](docs/data-model.md).
- Hand-edit files in `src/design-system/tokens/generated/`. Change `tokens/` and run `npm run tokens`.
- Change a palette value without the contrast check passing.
- Add NativeWind, Tamagui, gluestack, or another styling system. The design system shown here is this repo's own.
