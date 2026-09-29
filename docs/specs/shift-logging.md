# Three-phase shift logging

Status: built · updated 2026-09-28

## Daily Sheet

Each operational date has one Morning, one Midday handoff, and one Night log. The Daily Sheet groups these records; it is derived, not stored. The previous 21 days are complete fictional history. Today starts with three pending logs. Each log has one required check (restock), an optional note, sign-offs, a check history, and Shift Photos.

The day runs in order. Jordan signs Morning, then sends the Midday handoff. Avery reviews the open issues, acknowledges them when receiving Midday, then signs Night. Elena can inspect logs and issues but cannot sign or raise them. The mock API enforces sequence and account permissions as well as the UI.

| Phase | Required checks |
| --- | --- |
| Morning | Restock status checked |
| Midday | Restock status handed off |
| Night | Restock staged or shortage recorded |

Checking a box saves immediately and records the actor and time. Sign-off requires the check. Midday needs Jordan's outgoing and Avery's receiving signatures. The Daily Sheet is complete only after all three logs have their required signatures. Open issues do not change this status.

## Screens and actions

- Dashboard shows today's Daily Sheet, the signed-in account's next action, and open issues. Elena also sees this week's metrics and every open issue.
- Logs groups Daily Sheets by date and opens a log in the shared modal without changing sections.
- The modal shows checks and their history, issue review and linked issues, sign-off metadata, note, and Shift Photos. It is read-only when the account cannot edit the log.
- The Issues tab lets Shift Managers raise and resolve issues across shifts. See [issues.md](issues.md).
- Photos can be added from four places: the center camera tab (phones), the Take photo button on a Dashboard shift card, the Add photos card on Shift Photos, and inside the shift sheet (its top section and a bar pinned to the bottom). Jordan can add to Morning and Midday and Avery to Midday and Night, while the form is not signed off and it is today's. Elena cannot add photos.
- Shift Photos shows saved photos by day and phase. See [the data model](../data-model.md) for draft and deletion rules.

The modal has a Close action, uses safe areas, and returns to its originating screen. Sign-off is blocked while photo drafts remain unsaved. Closing the form discards its local note draft; saved checks and shift photos remain in the mock API.

## Data and state

RTK Query owns logs, issues, and their mutations. Redux slices hold UI choices and unsaved shift photo drafts. Daily Sheet status, next actions, manager metrics, and open issue lists are derived from query data. The mock source is in memory and resets on app restart. All records and seeded drawings are fictional.

Dashboard, Logs, Issues, Shift Photos, and the modal show loading, empty, and error states where applicable. Errors offer a retry; a failed mutation keeps its editable draft. Interactive controls have labels and touch targets of at least 44×44.

## Acceptance

- Today shows Morning, Midday, and Night in order; 21 previous dates each have three signed logs.
- Jordan cannot send Midday before Morning; Avery cannot receive it before Jordan sends it or complete Night before receipt.
- Avery's receipt records which open issues were reviewed. An open issue cannot be silently skipped.
- Multiple issues may be linked to one log, including issues raised after sign-off on today's log. Resolved issues remain in history.
- Checks record every toggle and show the actor and time in history.
- Shift photos can be reviewed and removed before save. Only Elena can delete a saved photo.
- The Dashboard, Logs, and Issues flows retain their context when a log modal opens and closes.

Issue evidence photos and the Manager Daily Report are specified separately in [issue-photos.md](issue-photos.md).
