# ShiftLogModal

Status: built · 2026-09-26

## Purpose

`ShiftLogModal` presents one Morning, Midday handoff, or Night record over the screen that opened it. It replaces the normal `/logs/[id]` navigation flow while reusing the existing form, validation, mutation, and read-only detail behavior.

This is a feature component under `src/features/logs/`, not a generic design-system primitive.

## Interface

```ts
interface ShiftLogModalProps {
  logId: string | null;
  onClose: () => void;
}
```

- `logId === null` means the modal is closed and does not request detail data.
- The component fetches the selected record through RTK Query and derives edit permission from the active demo account.
- Successful submission closes the modal through `onClose`; it does not navigate.

## Layout

- React Native platform `Modal` with a semantic overlay scrim.
- Centered surface on wide screens and a safe-area-contained near-full-screen surface on phones.
- Header contains phase/date, written status, and a 44×44 Close action.
- Body scrolls independently and contains Shift Photos, confirmations and check history, linked issues, note, sign-off metadata, and action.
- One primary form action at the bottom; all other actions are outline or ghost.

## Interaction

- Dashboard and Logs own `selectedLogId` in local state and pass it into the shared modal.
- The scrim does not dismiss an editable record.
- Close and the platform back request discard an unsubmitted local draft and return focus to the trigger.
- Escape closes on web when a mutation is not running.
- Submission cannot close or double-submit while its mutation is running.
- Signed logs and Elena's observer view are read-only.

## States

- Loading: shared loading state inside the modal surface.
- Not found: message and Close action.
- Error: message with Retry and Close.
- Editable: only for the account owning the current sequential action.
- Read-only: signed record, non-owning Shift Manager, or Operations Manager.
- Mutation error: form and draft remain visible for retry.

## Accessibility

- Modal content is announced as modal and traps focus on web.
- Close has a full accessible label.
- Focus returns to the opening card/action after close.
- Status, ownership, and validation are stated in text and never rely on color.
- All existing checkbox semantics and 44×44 targets remain intact.

## Acceptance

- Opening from Dashboard leaves Dashboard selected and visible behind the overlay.
- Opening from Logs leaves Logs selected and visible behind the overlay.
- Closing returns to the same trigger without a route change.
- Jordan can complete Morning and send Midday only in sequence.
- Avery can receive Midday and complete Night only in sequence.
- Elena can inspect but never submit.
- Desktop and phone Playwright coverage exercises open, validation, submit, close, focus return, and read-only behavior.
