# 0006 — Own palette and an in-repo token pipeline

Status: Accepted · 2026-09-21 · Amended 2026-09-23

## Context
The app needs one installable, auditable token source for React Native and web. Cross-repo token synchronization would add coupling and make a fresh clone incomplete.

## Decision
- Own the tokens in this repo: `tokens/` as W3C DTCG JSON, in primitive → semantic → accent tiers.
- The palette uses `ink` neutrals, Care blue as the default accent, optional Plum and Sea glass accents, and fixed semantic status colors. Values and contrast results are in [tokens.md](../design-system/tokens.md).
- Style Dictionary in this repo builds a typed React Native theme and a CSS file.
- `scripts/check-contrast.mjs` fails the token build if any required pair falls below its WCAG minimum.
- Components define their own shared types (`Size`, `ButtonVariant`, `StatusVariant`, …) in `src/design-system/types.ts`.

## Consequences
- One repo, one install, no sync step. A fresh clone has everything.
- The palette was designed for this app and checked for contrast before any code exists; the check becomes a build gate.
- Loses the "my web design system went cross-platform" story. It is replaced by "tokens → RN + CSS from one source, with contrast enforced at build time."
- Rejected: a cross-repo token dependency, direct reuse of a client palette, and a general-purpose color library. The local palette is tuned to this app's states and contrast requirements.

The 2026-09-23 amendment finalized blue-charcoal neutrals with Care blue as default and Plum / Sea glass options. Fixed coral, gold, green, and information-blue families retain semantic meaning.
