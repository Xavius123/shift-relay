# High-priority issues

Status: built · documented 2026-09-28

Shift Managers can flag several issues per log, including after today's log is signed. They can also flag an issue from the Issues tab without a source log. Elena observes and cannot raise or resolve issues. Records stay in the in-memory mock API and reset on restart.

## Categories and form

The preset categories are Safety hazard, Equipment failure, Security concern, and Temperature alarm. Other requires a written description. Preset categories allow optional details. The issue is saved when **Flag issue** is pressed, independently of log sign-off. A failed save keeps the draft and shows an error.

An issue stores its category, details, source log ID or null, status, raiser, timestamps, resolver, and ordered `raised`/`resolved` events. The source log may have any number of linked issues. See [the data model](../data-model.md).

## Screens and handoff

- Issues tab defaults to Open and offers Open, Resolved, and All filters with counts. The filter is UI state; issues remain in RTK Query. A linked issue opens its source log modal.
- Dashboard shows open issues; Elena sees the complete open list beneath the Daily Sheet.
- A log modal shows issues linked to that log and lets a Shift Manager flag another issue on today's log.
- When Avery receives Midday, every issue open at that point must be acknowledged. The receipt stores the issue IDs, actor, and time in `issueReview` and appends a check-history event. The mock API rejects a receipt that omits an open issue.

The Issues screen has loading, empty, error with Retry, and stale-data states. Resolution failure leaves the issue open and shows an error. Every issue's status and actions are labeled in words. Evidence and proof photos are covered in [issue-photos.md](issue-photos.md).
