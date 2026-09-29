# 0009 — Issue photos: expo-image-picker, URIs kept in the mock API

Status: Accepted · 2026-09-26

## Context
Shift Managers need to photograph issues and attach the photos to the issue they raise or resolve, and the Operations Manager reviews them later ([issue photos spec](../specs/issue-photos.md)). The app runs on web and on the iPhone through Expo Go ([ADR 0007](0007-web-and-ios-targets-playwright-e2e.md)), and all data lives in an in-memory mock API ([ADR 0002](0002-redux-toolkit-and-rtk-query.md)). `expo-image-picker` 57.0.20 (checked in `node_modules` today) is already installed (a `/camera` test bench, since removed, proved it first).

## Decision
- Capture with **`expo-image-picker`**: `launchCameraAsync` and `launchImageLibraryAsync` (multi-select), `quality: 0.7`. It runs in Expo Go, and on web it opens a file input.
- Store each photo as a **URI string** on `Issue.photos`, sent in the same `raiseIssue` / `resolveIssue` mutation as the issue. The mock API keeps it in memory like the rest of the session's data.
- Seed photos are bundled fictional images under `assets/seed-photos/`, referenced through `Image.resolveAssetSource` so they have URIs like picked photos.
- Display with React Native `Image`; a failed load shows a text placeholder.

## Consequences
- No new dependency, no native config beyond the existing `cameraPermission` / `photosPermission` strings in `app.json`.
- Photos disappear on reload or restart: web gives `blob:`/`data:` URIs and iOS gives cache-file URIs. This matches the mock API, which also resets, and is stated in the README walkthrough.
- A real backend would replace the URI hand-off with an upload step that returns a server URL. Components only render `uri`, so the swap stays inside `logsApi`.
- Web `data:` URIs can be large; the 5-photo limit and `quality: 0.7` keep the in-memory store small.
- Rejected: `expo-camera` (custom camera UI, more code, nothing gained over the system camera for this); base64 in Redux slices (violates "server data only in RTK Query" and bloats the store); `expo-file-system` copies (extra dependency for persistence the mock doesn't have).
