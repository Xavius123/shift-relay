# Issue photos and the Manager Daily Report

Status: proposed · 2026-09-26

## Outcome

Morning and Night Shift Managers can photograph an issue when they raise it and when they resolve it. The photos are part of the issue, and every issue is part of one shift log, so each day's logs, issues, and photos form one reviewable record. The Operations Manager reviews that record for a date on a Manager-only **Daily Report** page.

## Decisions

- Photos are **optional**, except a **Safety hazard** issue needs at least one evidence photo before it can be raised.
- Resolution photos are always optional.
- The Daily Report is a page, not a modal, and only a Manager account can see it. Shift forms stay modals.
- Storage follows [ADR 0009](../decisions/0009-issue-photos-in-the-mock-api.md): photo URIs are kept in the mock API's memory with the rest of the session's data.

## Data

```ts
export type IssuePhotoPurpose = 'evidence' | 'resolution';

export interface IssuePhoto {
  id: string;
  uri: string;
  purpose: IssuePhotoPurpose;
  takenBy: string;
  takenAt: string;
}

export interface Issue {
  // existing fields
  sourceLogId: string; // now required: every issue belongs to one log
  photos: IssuePhoto[]; // oldest first
  events: IssueEvent[]; // IssueEvent.type gains 'photoAdded'
}

export interface RaiseIssueInput {
  // existing fields
  sourceLogId: string | null; // null from the Issues tab: the API links the active log
  photoUris: string[];
}

export interface ResolveIssueInput {
  // existing fields
  photoUris: string[];
}
```

- `sourceLogId` becomes required on the stored issue. An issue raised from the Issues tab links to **today's active log**: the first of Morning → Midday → Night that is not signed off, or Night when all are signed. No issue exists outside a report.
- Each photo appends a `photoAdded` event after the `raised` event, and before the `resolved` event when added at resolution.
- Photos are never edited or removed after submission. A form can remove a photo before it submits.

## Rules (enforced by the mock API, not only the screen)

| Rule | Error |
|------|-------|
| Only a Shift Manager can raise, resolve, or attach photos | 409 `A Shift Manager must …` |
| `safety` needs at least one evidence photo | 409 `Add a photo of the safety hazard.` |
| At most 5 photos per submission | 409 `Attach up to 5 photos.` |
| Resolution photos only while the issue is open | Resolving is already once only |

The issue and its photos save in the same `raiseIssue` or `resolveIssue` call: both are stored, or neither is.

## Forms

### Raise issue (inside the shift log modal and the Issues tab)

- Category, details (as today), then a **Photos** section:
  - `Take photo` (camera) and `Choose photos` (library, multi-select). Both use `expo-image-picker`, reusing the permission and error handling proven on the `/camera` test bench.
  - Thumbnails, 4 per row, each with a labeled 44×44 `Remove photo N` action.
  - Helper text: `Optional` for most categories. For Safety: `Required: add at least one photo of the hazard.`
- Validation joins `issueDraftError`: Safety without a photo shows the photo requirement next to the Photos section.
- A failed submit keeps the category, details, and photos for retry.

### Resolve issue

- `Resolve` opens a small confirm step with an optional Photos section (`Proof of fix`) and the resolve action.

### Shift log sign-off

- Before signing, the modal summarizes what the signature covers: `2 issues · 3 photos raised from this log`.

## Daily Report (Manager only)

Route: `/overview/report/[date]` (inside the Overview stack, so it inherits the Manager guard and keeps Overview selected).

Entry points:

- Overview: each day listed for the current period links to its report, and each open issue has `View report`.
- Signed-out users and Shift Managers who open the URL see the existing Manager access-required state.

Content, read-only, in this order:

1. Header: date, Daily Sheet status, counts (`3 of 3 signed · 2 issues · 4 photos`).
2. For each of Morning, Midday handoff, Night:
   - status and each sign-off (who, when; Midday shows Morning sent / Night received)
   - required checks with the final state, and a collapsible check history
   - note
   - Midday: Night's review of open issues on receipt
   - issues raised from this log: category, details, status, raised by and when, a photo strip (evidence, then resolution), and the event timeline
3. Issues resolved that day that were raised on an earlier date: listed separately with a link to their origin date's report.

Photo viewer: selecting a thumbnail opens a full-screen modal with the image, purpose, who took it, when, and `Photo N of M`. It closes with Close, Escape, or the platform back action.

## Seed data

- Add three generic, fictional placeholder images under `assets/seed-photos/`. They are illustrations or stock-free renders with no people, text, logos, or identifiable places.
- Of the six seeded issues, four carry one evidence photo; two resolved ones also carry a resolution photo. The seeded Safety issue has a photo so seed data follows the rule.

## Overview addition

- One summary metric: `Issues with photos`, e.g. `4 of 6`, for the current period.

## States

- Report: loading, not-found for a date outside the history (`No report for this date`), error with Retry, and stale data.
- Photo that fails to load: a placeholder tile with `Photo unavailable` text, never a broken image.
- Camera permission denied: message plus `Open Settings` on iOS (as on the test bench); library still available.

## Accessibility

- Each thumbnail's label states its purpose, index, taker, and time.
- The Safety requirement is stated in text, never by color alone.
- Report sections use headings; the photo viewer is announced as a modal and returns focus to the thumbnail.

## Acceptance

- Jordan raises an Equipment issue with no photo: it saves.
- Jordan raises a Safety issue with no photo: blocked with the photo message, both in the form and by the API.
- On web, a Playwright file chooser attaches a test image; the thumbnail appears; the issue saves with one evidence photo.
- An issue raised from the Issues tab appears under today's active log in the report.
- Avery resolves an issue with a proof photo; it appears after the evidence photo, with `photoAdded` and `resolved` events.
- Elena opens a report from the Overview and sees all three logs, their checks, issues, and photos; the viewer opens and closes back to the thumbnail.
- Jordan and signed-out users get the access-required state at `/overview/report/[date]`.
- iPhone: take a real photo while raising a Safety issue, then review it as Elena.
- The `/camera` test bench and its nav item are removed once this passes.

## Non-goals

- Real upload, cloud storage, or keeping photos after a restart
- Annotating, cropping, or editing photos
- Video
- Photos on shift logs that aren't tied to an issue
- Exporting or printing the report (the page layout keeps this possible later)
- Shift Manager access to the report page
