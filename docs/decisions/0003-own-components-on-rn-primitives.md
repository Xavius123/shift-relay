# 0003 — Own components on RN primitives; `@rn-primitives` only for complex ones

Status: Accepted · 2026-09-21

## Context
Base UI and Radix, headless libraries used on web, render DOM elements and do not run in React Native. The role centers on design systems, so owning the component layer is the point.

## Decision
- Build Text, Button, Card, Badge, Input on `Pressable` / `Text` / `TextInput` / `View`, styled only from tokens.
- If a complex component is added (Select, Dialog), use `@rn-primitives`, which follows Radix's compound-component API. Check its Expo compatibility at install time.
- No styling framework (NativeWind, Tamagui, gluestack).

## Consequences
- Shared variant and size types keep the component API consistent.
- More code than adopting a kit, but every line is the design system's own.
- Focus management and overlays are delegated only where they are genuinely hard.
