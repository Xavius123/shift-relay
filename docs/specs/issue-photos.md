# Issue photos and the Manager Daily Report

Status: built · 2026-09-26

Shift Managers can photograph an issue when they raise it and when they resolve it. The photos belong to the issue, every issue belongs to one shift log, and the Operations Manager reviews a day's logs, issues, and photos on a Manager-only **Daily Report** page. Storage follows [ADR 0009](../decisions/0009-issue-photos-in-the-mock-api.md): photo URIs live in the mock API's memory.

## Rules

Enforced by the mock API as well as the screens.

| Rule | Error |
|------|-------|
| Only a Shift Manager can raise, resolve, or attach photos | 409 `A Shift Manager must …` |
| A **Safety** issue needs at least one evidence photo | 409 `Add a photo of the safety hazard.` |
| At most 5 photos per submission | 409 `Attach up to 5 photos.` |
| Resolution photos are optional and only while the issue is open | Resolving is once only |

- Every other category has optional photos.
- The issue and its photos save in one `raiseIssue` or `resolveIssue` call: both are stored, or neither.
- Photos can be removed in a form before it submits, never after.
- `sourceLogId` is required on a stored issue. An issue raised from the Issues tab links to today's active log: the first of Morning → Midday → Night not yet signed, or Night when all are signed.
- Each photo appends a `photoAdded` event after `raised` (or before `resolved`, when added at resolution).

Types: [data-model.md](../data-model.md) (`IssuePhoto`, `Issue.photos`, and the `photos` inputs, each with a `source`).

## Forms

- **Raise issue** (shift log modal and Issues tab): category and details, then a **Photos** section with `Camera` and `Choose photos` on a device with a camera, or a single `Upload photos` on a desktop browser (all `expo-image-picker` through the shared `usePhotoPicker` hook, which handles permission and errors and tags each photo `camera` or `upload`). An issue that has uploaded photos says how many, in text. Thumbnails have a labeled 44×44 `Remove photo N` action. Safety shows `Required: add at least one photo of the hazard.` A failed submit keeps the category, details, and photos.
- **Resolve issue:** `Resolve` opens a confirm step with an optional `Proof of fix` photo section.
- **Sign-off:** the modal summarizes what the signature covers, for example `2 issues · 3 photos raised from this log`.

## Daily Report (Manager only)

Route `/report/[date]`, inside the Dashboard stack, reached from `Today's report` on Elena's Dashboard. Shift Managers and signed-out users who open the URL get the access-required state. Read-only, in order:

1. Header: date, Daily Sheet status, and counts (`3 of 3 signed · 2 issues · 4 photos`).
2. Morning, Midday handoff, and Night, each with sign-offs, final checks and history, note, Night's review of open issues (Midday), and the issues raised from that log with a photo strip (evidence, then resolution) and event timeline.
3. Issues resolved that day but raised earlier, linking to their origin date's report.

Selecting a thumbnail opens a full-screen viewer with the image, purpose, who took it, when, and `Photo N of M`. It closes with the X button, Escape, or the platform back action and returns focus to the thumbnail.

## States and accessibility

- Report: loading, not-found for a date outside the history, error with Retry, and stale data.
- A photo that fails to load shows a `Photo unavailable` tile, never a broken image.
- Camera permission denied: a message, plus `Open Settings` on iOS; the library still works.
- Thumbnail labels state purpose, index, taker, and time. The Safety requirement is stated in text. Report sections use headings.

## Seed data

Seed photos are the fictional drawings from `scripts/build-seed-photos.mjs` (`npm run seed-photos`), stored as `data:` URIs, with no real people, logos, or places. Of the six seeded issues, four carry an evidence photo and two resolved ones also carry a resolution photo, including the Safety issue.

## Non-goals

Real upload or persistence after restart; editing, cropping, or annotating photos; video; photos not tied to an issue; exporting or printing the report; Shift Manager access to the report.
