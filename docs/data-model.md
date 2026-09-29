# Data model

The app uses fictional Shift Managers, operational logs, and high-priority issues. Nothing in the public repository identifies a real employee, customer, facility, or work order.

## Types

```ts
export type ShiftPhase = 'morning' | 'midday' | 'night';
export type LogStatus = 'pending' | 'awaitingSecondSignOff' | 'signedOff';

export interface LogConfirmation {
  id: string;
  label: string;
  confirmed: boolean;
}

export interface LogSignOff {
  actor: string;
  at: string; // ISO timestamp
}

/** One flip of a required check. */
export interface CheckEvent {
  checkId: string;
  label: string;
  checked: boolean;
  actor: string;
  at: string;
}

export interface ShiftLog {
  id: string; // "LOG-2026-09-23-morning"
  operationalDate: string; // local YYYY-MM-DD
  phase: ShiftPhase;
  status: LogStatus;
  confirmations: LogConfirmation[]; // exactly one
  note: string | null;
  signOffs: LogSignOff[];
  checkEvents: CheckEvent[]; // oldest first
  issueReview: { issueIds: string[]; actor: string; at: string } | null; // Midday receipt
  walkPhotos: WalkPhoto[]; // oldest first
}

export interface WalkPhoto {
  id: string;
  uri: string; // local file URI on iOS; data or blob URI on web
  caption: string | null;
  source: 'camera' | 'upload'; // see "Photo source" below
  actor: string;
  at: string;
}

export type IssueCategory = 'safety' | 'equipment' | 'security' | 'temperature' | 'other';
export type IssueStatus = 'open' | 'resolved';

export interface IssueEvent {
  type: 'raised' | 'resolved' | 'photoAdded';
  actor: string;
  at: string;
}

export interface IssuePhoto {
  id: string;
  uri: string;
  purpose: 'evidence' | 'resolution';
  source: 'camera' | 'upload';
  takenBy: string;
  takenAt: string;
}

export interface Issue {
  id: string; // "ISS-001"
  category: IssueCategory;
  details: string; // optional context for a preset; the description for "other"
  sourceLogId: string; // every issue belongs to one log
  photos: IssuePhoto[]; // oldest first
  status: IssueStatus;
  raisedBy: string;
  raisedAt: string;
  resolvedBy: string | null;
  resolvedAt: string | null;
  events: IssueEvent[]; // oldest first
}
```

Issue types live in `src/features/issues/types.ts`; log types in `src/features/logs/types.ts`.

`RaiseIssueInput.sourceLogId` is `string | null`: from the Issues tab it is `null` and the mock API links today's active log. `RaiseIssueInput` and `ResolveIssueInput` also take optional `photos: { uri, source }[]`, and `AddWalkPhotosInput` takes `photos` the same way.

**Invariants:**

- Each operational date has exactly one log for each phase.
- Each log has exactly one phase-specific confirmation, about restock.
- Checks toggle only on today's pending log, by the Shift Manager whose turn it is. Every toggle appends a `CheckEvent`.
- Sign-off requires the confirmation to be set on the stored log.
- A signed Morning or Night log has all confirmations set and one sign-off.
- A Midday log with the Morning Shift Manager's sign-off has `awaitingSecondSignOff`.
- A signed Midday log has all confirmations set, followed by the Night Shift Manager's receipt sign-off.
- Night can't receive the handoff while issues are open without acknowledging all of them ("Open issues reviewed (N)"). The acknowledgement is stored as `issueReview` and appended as a `CheckEvent`.
- Shift Managers raise and resolve issues; the Operations Manager observes them.
- A log has any number of issues. An `other` issue has non-empty `details`.
- A resolved issue has resolver, resolution timestamp, and a `resolved` event.
- Resolving an issue never mutates or deletes its source log.

**Derived, never stored:** today's phase progress, open issue count (nav badge and Dashboard), history groups, and age labels.

The UI also derives a `DailySheetSummary` for each operational date from its three `ShiftLog` records. It contains the ordered phase records, overall `notStarted | inProgress | complete` status, and the active account's next action. It is never persisted or copied into Redux.

Issue photos are built ([issue-photos.md](specs/issue-photos.md)): `Issue.photos` holds evidence and resolution photos, and each photo adds a `photoAdded` event stamped with the same time as the raise or resolve it came with. The UI shows those as one trail line ("Raised by … · 1 photo").

**Shift Photos** are built. Every `ShiftLog` has `walkPhotos: WalkPhoto[]` (`id`, `uri`, `caption`, `source`, `actor`, `at`), oldest first. A Shift Manager takes photos, reviews them as drafts, and saves them; drafts are UI state in `walkDraftsSlice` (per log, never sent to the API), and sign-off is refused while any remain. `addWalkPhotos(input)` saves drafts to today's form that is not signed off, from the Shift Manager who owns that phase: Jordan adds to Morning and Midday, Avery to Midday and Night. It does not have to be their turn to sign. Elena cannot add photos. `removeWalkPhoto(input)` is Operations Manager only, on any date: saved photos are the record. The URI points at the image on the device (a data or blob URI on web), and nothing is uploaded. Every signed-off historical shift has one or two fictional drawings from `scripts/build-seed-photos.mjs`, including a mouse on duty. Only today's pending shifts start with none.

## Photo source

Every shift photo and issue photo records where it came from. `camera` means a camera took it: a native build, or a touch-first browser (a phone or tablet). `upload` means it came from a file or the photo library, which includes the desktop browser's file picker and any photo picked from an iPhone's library. The device decides (`features/camera/captureSupport.ts`), so a desktop browser shows "Upload photos" instead of "Take photo" and never claims a camera. Uploads are allowed but tagged "Uploaded" wherever the photo is shown. Seed photos are `camera`. A real backend would also strip location metadata from uploads and compare the file's own timestamp with the shift.

## Seed dataset

- Generate the previous 21 local calendar days at mock initialization.
- Each historical day has Morning, Midday, and Night signed off: 63 logs, each with a check history.
- Those 63 logs render as 21 complete Daily Sheets and move with the device-local calendar at initialization.
- Generate today's three logs as pending so the walkthrough can start with any phase.
- Link six issues to historical logs: four resolved and two open.
- Use deterministic templates and fictional Shift Managers so tests remain stable.
- Restarting the app restores the generated seed state.

## Mock API

| Endpoint | Returns |
|----------|---------|
| `getShiftLogs` | `ShiftLog[]` for today and the seeded history |
| `getShiftLog(id)` | `ShiftLog`, or a 404-shaped error |
| `toggleLogCheck(input)` | Updated `ShiftLog` with the new `CheckEvent`; optimistic in the cache |
| `signOffShiftLog(input)` | Updated `ShiftLog`; Midday advances through two approvals, the second requiring `reviewedIssueIds` to cover every open issue |
| `getIssues` | `Issue[]` |
| `raiseIssue(input)` | New open `Issue` |
| `resolveIssue(input)` | Resolved `Issue` with resolver and timestamp |
| `addWalkPhotos(input)` | Updated `ShiftLog` with saved shift photos |
| `removeWalkPhoto(input)` | Updated `ShiftLog` after an Operations Manager deletes a saved photo |

The mock base query reads latency and simulated-failure controls from Redux. Mutations update the in-memory mock source and RTK Query cache.
