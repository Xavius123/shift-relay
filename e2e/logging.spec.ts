import { expect, test, type Page } from '@playwright/test';

import { openSignIn } from './nav';
import { expectSession, openAs } from './session';

async function signInAs(page: Page, account: 'jordan' | 'avery' | 'elena') {
  await openSignIn(page);
  await page.getByTestId(`demo-sign-in-${account}`).click();
}

async function checkAll(page: Page, labels: readonly string[]) {
  for (const name of labels) {
    const check = page.getByRole('switch', { name });
    await check.click();
    await expect(check).toHaveAttribute('aria-checked', 'true');
  }
}

test('Daily Sheet runs Morning, handoff, and Night in modals, with a flagged issue', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.goto('/sign-in');
  await page.getByTestId('demo-sign-in-jordan').click();

  const modal = page.getByTestId('shift-log-modal');
  await expectSession(page, 'Jordan Lee');
  // Morning's sheet stops at the handoff it sends; Night isn't its concern.
  await expect(page.getByTestId('shift-card-morning')).toBeVisible();
  await expect(page.getByTestId('shift-card-midday')).toBeVisible();
  await expect(page.getByTestId('shift-card-night')).toHaveCount(0);
  await expect(page.getByTestId('daily-sheet-status')).toHaveText('Not started');
  await expect(page.getByTestId('next-action-button')).toHaveText('Complete Morning');

  // Morning: validation, then sign-off. The modal closes without a route change.
  await page.getByTestId('next-action-button').click();
  await expect(modal).toBeVisible();
  await page.getByTestId('sign-off-log').click();
  await expect(page.getByTestId('log-validation-error')).toContainText('Confirm the restock check');
  await checkAll(page, ['Restock status checked']);
  await page.getByTestId('sign-off-log').click();
  await expect(modal).toHaveCount(0);
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId('daily-sheet-status')).toHaveText('In progress');
  await expect(page.getByTestId('shift-card-morning')).toContainText('Signed off');

  // Midday: Jordan flags an issue on the handoff, then sends it.
  await expect(page.getByTestId('next-action-button')).toHaveText('Send handoff to Night');
  await page.getByTestId('next-action-button').click();
  await checkAll(page, ['Restock status handed off']);
  await page.getByTestId('log-note-field').fill('Midday turnover is ready for review.');
  await page.getByTestId('log-flag-issue').click();
  await page.getByTestId('issue-category-safety').click();
  await page.getByTestId('raise-issue-details-field').fill('Emergency eyewash supply is low.');
  // Safety needs an evidence photo; on web the picker is a file input.
  const chooser = page.waitForEvent('filechooser');
  await page.getByTestId('raise-issue-choose-photos').click();
  await (await chooser).setFiles('assets/favicon-shift-relay.png');
  await page.getByTestId('raise-issue-submit').click();
  const issue = page.getByTestId('log-issues').getByTestId('issue-ISS-007');
  await expect(issue).toContainText('Safety hazard');
  await expect(issue.getByLabel('Raised by Jordan Lee')).toHaveText('JL');
  await page.getByTestId('sign-off-log').click();
  await expect(modal).toHaveCount(0);
  await expect(page.getByTestId('dashboard-issues')).toContainText('3 open');
  await expect(page.getByTestId('shift-card-midday')).toContainText('Awaiting Night');
  await expect(page.getByTestId('next-action-status')).toHaveText('Waiting for Night');

  // Jordan cannot receive his own handoff.
  await page.getByTestId('shift-card-midday').click();
  await expect(page.getByTestId('second-sign-off')).toContainText("Switch to Avery's account");
  await expect(page.getByTestId('approve-second-sign-off')).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await page.getByTestId('close-shift-log').click();
  await expect(modal).toHaveCount(0);

  // Avery receives the handoff, then completes Night.
  await signInAs(page, 'avery');
  await expectSession(page, 'Avery Smith');
  await expect(page.getByTestId('shift-card-night')).toBeVisible();
  await expect(page.getByTestId('next-action-button')).toHaveText('Receive handoff');
  await page.getByTestId('next-action-button').click();
  await expect(page.getByTestId('second-sign-off')).toContainText('Reviewing as Avery Smith');
  // Night must acknowledge every open issue before receiving the handoff.
  const approve = page.getByTestId('approve-second-sign-off');
  await expect(approve).toHaveAttribute('aria-disabled', 'true');
  await expect(page.getByTestId('handoff-issue-review')).toContainText('Safety hazard');
  await page.getByRole('switch', { name: 'Open issues reviewed (3)' }).click();
  await approve.click();
  await expect(modal).toHaveCount(0);
  await expect(page.getByTestId('shift-card-midday')).toContainText('Received');

  await expect(page.getByTestId('next-action-button')).toHaveText('Complete Night');
  await page.getByTestId('next-action-button').click();
  await checkAll(page, ['Restock staged or shortage recorded']);
  await page.getByTestId('sign-off-log').click();
  await expect(modal).toHaveCount(0);
  await expect(page.getByTestId('daily-sheet-status')).toHaveText('Complete');
  await expect(page.getByTestId('next-action-status')).toHaveText('Daily Sheet complete');

  // Avery resolves it from the Issues tab; the source log keeps the trail.
  await page.getByTestId('dashboard-view-issues').click();
  await expect(page.getByTestId('screen-issues')).toBeVisible();
  await page.getByTestId('resolve-issue-ISS-007').click();
  await page.getByTestId('confirm-resolve-ISS-007').click();
  await expect(page.getByTestId('screen-issues').getByTestId('issue-ISS-007')).toHaveCount(0);
  await page.getByTestId('nav-dashboard').click();

  await page.getByTestId('shift-card-midday').click();
  await expect(page.getByTestId('log-status')).toHaveText('Received');
  const summary = page.getByTestId('log-sign-off-summary');
  await expect(summary).toContainText('Morning sent · Jordan Lee');
  await expect(summary).toContainText('Night received · Avery Smith');
  await expect(page.getByTestId('handoff-issues-acknowledged')).toHaveText(
    'Avery Smith reviewed 3 open issues on receipt',
  );
  // The acknowledgement is in the history, which stays folded away until asked for.
  await expect(page.getByTestId('check-events')).toHaveCount(0);
  await page.getByTestId('check-history-toggle').click();
  await expect(page.getByTestId('check-events')).toContainText(
    'Avery Smith checked Open issues reviewed (3)',
  );
  const linked = page.getByTestId('log-issues').getByTestId('issue-ISS-007');
  await expect(linked).toContainText('Resolved');
  await expect(linked.getByLabel('Resolved by Avery Smith')).toHaveText('AS');
});

test('the sequence and read-only views are enforced per account', async ({ page }) => {
  await page.goto('/sign-in');
  await page.getByTestId('demo-sign-in-avery').click();
  await expect(page.getByTestId('next-action-status')).toHaveText('Morning not complete');

  await page.getByTestId('shift-card-night').click();
  await expect(page.getByTestId('signer-required')).toContainText(
    'Receive the Midday handoff before completing Night.',
  );
  await expect(page.getByTestId('sign-off-log')).toHaveAttribute('aria-disabled', 'true');
  await page.getByTestId('close-shift-log').click();

  await signInAs(page, 'elena');
  await page.getByTestId('nav-dashboard').click();
  await expect(page.getByTestId('next-action-status')).toHaveText('Morning not complete');
  await expect(page.getByTestId('next-action')).toContainText('Read-only view');
  await expect(page.getByTestId('next-action-button')).toHaveCount(0);

  await page.getByTestId('shift-card-morning').click();
  await expect(page.getByTestId('sign-off-log')).toHaveAttribute('aria-disabled', 'true');
  await expect(page.getByRole('switch', { name: 'Restock status checked' })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
});

test('a log opened from Logs closes back to the same trigger', async ({ page }) => {
  await openAs(page, '/logs');
  const trigger = page.locator('[data-testid^="log-row-"]').nth(3);
  await trigger.click();

  await expect(page.getByTestId('shift-log-modal')).toBeVisible();
  await expect(page).toHaveURL(/\/logs$/);
  await expect(page.getByTestId('nav-logs')).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('log-status')).toHaveText('Signed off');

  await page.getByTestId('close-shift-log').click();
  await expect(page.getByTestId('shift-log-modal')).toHaveCount(0);
  await expect(trigger).toBeFocused();

  // Escape also closes on web.
  await trigger.click();
  // react-native-web marks the modal as a dialog once its fade-in finishes.
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('shift-log-modal')).toHaveCount(0);
});

test('history contains today plus 21 complete Daily Sheets', async ({ page }) => {
  await openAs(page, '/logs');
  await expect(page.getByTestId('screen-logs')).toBeVisible();
  await expect(page.getByTestId('logs-history-count')).toHaveText('22 operational days');
  // The list is virtualized, so check the newest sheets rather than counting rendered rows.
  const days = page.locator('[data-testid^="log-day-"]');
  await expect(days.nth(0)).toContainText('Daily Sheet · Not started');
  await expect(days.nth(1)).toContainText('Daily Sheet · Complete');
  // Count the row buttons: initials badges inside a row share the `log-row-` prefix.
  await expect(days.nth(1).getByRole('button', { name: /^Open .* log$/ })).toHaveCount(3);
});

test('Logs table searches and switches between grouped and flat views', async ({ page }) => {
  await openAs(page, '/logs');
  await expect(page.getByTestId('logs-history-count')).toHaveText('22 operational days');

  await page.getByTestId('logs-show-all').click();
  await expect(page.getByTestId('logs-history-count')).toHaveText('66 logs');
  await expect(page.locator('[data-testid^="log-day-"]')).toHaveCount(0);

  await page.getByLabel('Search logs').fill('midday');
  await expect(page.getByTestId('logs-history-count')).toHaveText('22 logs');

  await page.getByTestId('logs-group-by-day').click();
  await expect(page.getByTestId('logs-history-count')).toHaveText('22 operational days');
  await expect(
    page.locator('[data-testid^="log-day-"]').first().locator('[data-testid^="log-row-"]'),
  ).toHaveCount(1);

  await page.getByLabel('Search logs').fill('no log matches this');
  await expect(page.getByTestId('logs-no-results')).toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(page.getByTestId('logs-history-count')).toHaveText('22 operational days');
});

test('Logs table headers sort, and tapping again reverses', async ({ page }) => {
  await openAs(page, '/logs');
  const firstDay = page.locator('[data-testid^="log-day-"]').first();
  await expect(page.getByTestId('logs-sort-date-desc')).toBeVisible();
  const newest = await firstDay.getAttribute('data-testid');

  await page.getByTestId('logs-sort-date').click();
  await expect(page.getByTestId('logs-sort-date-asc')).toBeVisible();
  await expect(firstDay).not.toHaveAttribute('data-testid', newest ?? '');

  await page.getByTestId('logs-show-all').click();
  await page.getByTestId('logs-sort-status').click();
  await expect(page.getByTestId('logs-sort-status-asc')).toBeVisible();
  await expect(page.locator('[data-testid^="log-row-"]').first()).toContainText(/Pending|Not sent/);
  await page.getByTestId('logs-sort-status').click();
  await expect(page.getByTestId('logs-sort-status-desc')).toBeVisible();
  await expect(page.locator('[data-testid^="log-row-"]').first()).toContainText(
    /Signed off|Received/,
  );
});

test("required checks are switches on today's log, and every toggle is logged", async ({
  page,
}) => {
  await page.goto('/sign-in');
  await page.getByTestId('demo-sign-in-jordan').click();
  await page.getByTestId('next-action-button').click();

  const check = page.getByRole('switch', { name: 'Restock status checked' });
  await expect(check).toHaveAttribute('aria-checked', 'false');
  await check.click();
  await expect(check).toHaveAttribute('aria-checked', 'true');
  await check.click();
  await expect(check).toHaveAttribute('aria-checked', 'false');

  // History is a collapsed accordion at the bottom of the form.
  await expect(page.getByTestId('check-events')).toHaveCount(0);
  await page.getByTestId('check-history-toggle').click();
  const events = page.getByTestId('check-events');
  await expect(events).toContainText('Jordan Lee checked Restock status checked');
  await expect(events).toContainText('Jordan Lee unchecked Restock status checked');

  // Toggles are saved, not a local draft: they survive closing the modal.
  await check.click();
  await page.getByTestId('close-shift-log').click();
  await page.getByTestId('next-action-button').click();
  await expect(check).toHaveAttribute('aria-checked', 'true');
  await page.getByTestId('close-shift-log').click();

  // Past days are read-only, with their check history.
  await page.getByTestId('nav-logs').click();
  await page
    .locator('[data-testid^="log-day-"]')
    .nth(1)
    .locator('[data-testid^="log-row-"]')
    .first()
    .click();
  await expect(page.getByRole('switch').first()).toHaveAttribute('aria-disabled', 'true');
  await page.getByTestId('check-history-toggle').click();
  await expect(page.getByTestId('check-events')).toContainText('checked');
});
