# 0001 — Expo + Expo Router

Status: Accepted · 2026-09-21

## Context
The app must run live on an emulator in an interview, install cleanly from a public repo, and be built in a week.

## Decision
Expo (latest stable SDK at scaffold time) with Expo Router and the TypeScript template. Native packages are added with `npx expo install` so versions match the SDK.

## Consequences
- Fastest reliable path to a live web build and a real iPhone through Expo Go; no native project to maintain.
- File-based, typed routes keep screens thin.
- Custom native modules would need a dev build. None are needed here.
