# Setup

Everything needed to develop on web, run the E2E specs, and run the app on an iPhone. Targets are web and iOS ([ADR 0007](decisions/0007-web-and-ios-targets-playwright-e2e.md)). Run `npm run doctor:env` at any point to see what is still missing.

## 1. Node and dependencies

Node 20 or newer, then:

```bash
npm install
```

## 2. Web

```bash
npm run web
```

Opens the app at `http://localhost:8081`. Edits reload in the browser.

## 3. E2E (Playwright)

Download the browser once:

```bash
npx playwright install chromium
```

Then `npm run e2e`. It starts the web dev server if one isn't running already. `npm run e2e:ui` opens the Playwright UI to step through a spec. More in [testing.md](testing.md).

## 4. iPhone (Expo Go)

1. Install **Expo Go** from the App Store.
2. Run `npm start` on this machine.
3. Scan the QR code in the terminal with the iPhone camera. The app opens in Expo Go.

- The phone and this machine must be on the same Wi-Fi. If they can't be (or the network blocks it), use `npm run start:tunnel`.
- On Windows, allow Node through the firewall when asked, or the phone can't reach the dev server.
- Expo Go runs only the current Expo SDK. If it says the project's SDK is unsupported, update Expo Go, or check that the app is on the SDK Expo Go supports.
- Shake the phone (or three-finger long-press) for the dev menu: reload, performance monitor.

No Mac is needed for this. The iOS Simulator and development builds are out of scope ([ADR 0007](decisions/0007-web-and-ios-targets-playwright-e2e.md)).
