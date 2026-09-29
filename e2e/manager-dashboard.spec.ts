import { expect, test } from '@playwright/test';
import { openSignIn } from './nav';

test("the Operations Manager's Dashboard shows this week's numbers and every open issue", async ({
  page,
}) => {
  await page.goto('/sign-in');
  await page.getByTestId('demo-sign-in-elena').click();
  await expect(page.getByTestId('screen-dashboard')).toBeVisible();
  await expect(page.getByTestId('daily-sheet')).toBeVisible();
  // This week sits above the Daily Sheet; open issues below it.
  const week = await page.getByTestId('manager-week').boundingBox();
  const sheet = await page.getByTestId('daily-sheet').boundingBox();
  const issues = await page.getByTestId('manager-open-issues').boundingBox();
  expect(week && sheet && issues && week.y < sheet.y && sheet.y < issues.y).toBe(true);

  // Today's three forms are pending; the other six days are complete.
  await expect(page.getByTestId('metric-complete')).toContainText('18 of 21');
  await expect(page.getByTestId('metric-complete')).toContainText('86%');
  await expect(page.getByTestId('metric-awaiting')).toContainText('0');
  await expect(page.getByTestId('metric-raised')).toContainText('2');
  await expect(page.getByTestId('metric-open')).toContainText('2');
  // All four metrics share one row, even on a phone.
  const tops = await Promise.all(
    ['complete', 'awaiting', 'raised', 'open'].map(
      async (name) => (await page.getByTestId(`metric-${name}`).boundingBox())?.y,
    ),
  );
  expect(tops).toEqual([tops[0], tops[0], tops[0], tops[0]]);
  // The short Shift Manager issue card is replaced by the full list.
  await expect(page.getByTestId('dashboard-issues')).toHaveCount(0);

  // Open issues open their source log read-only, over the Dashboard.
  const openIssues = page.getByTestId('manager-open-issues');
  await expect(openIssues.locator('[data-testid^="issue-ISS-"]')).toHaveCount(2);
  await expect(page.getByTestId('resolve-issue-ISS-001')).toHaveCount(0);
  await page.getByTestId('open-source-ISS-001').click();
  await expect(page.getByTestId('shift-log-modal')).toBeVisible();
  await expect(page.getByTestId('log-status')).toHaveText('Signed off');
  await expect(page.getByTestId('log-flag-issue')).toHaveCount(0);
  await page.getByTestId('close-shift-log').click();
  await expect(page).toHaveURL(/\/$/);
});

test("a sent handoff counts as awaiting Night on the manager's Dashboard", async ({ page }) => {
  await page.goto('/sign-in');
  await page.getByTestId('demo-sign-in-jordan').click();
  await expect(page.getByTestId('manager-week')).toHaveCount(0);

  for (const labels of [
    ['Night notes reviewed', 'Restock status checked', 'Carry-over priorities assigned'],
    ['Completed work recorded', 'Remaining work reviewed', 'Night manager briefed'],
  ]) {
    await page.getByTestId('next-action-button').click();
    for (const name of labels) {
      const check = page.getByRole('switch', { name });
      await check.click();
      await expect(check).toHaveAttribute('aria-checked', 'true');
    }
    await page.getByTestId('sign-off-log').click();
    await expect(page.getByTestId('shift-log-modal')).toHaveCount(0);
  }

  await openSignIn(page);
  await page.getByTestId('demo-sign-in-elena').click();
  await expect(page.getByTestId('metric-complete')).toContainText('19 of 21');
  await expect(page.getByTestId('metric-awaiting')).toContainText('1');
});
