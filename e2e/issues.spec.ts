import { expect, test } from '@playwright/test';

test('Issues tab: nav badge, preset and written-in issues, resolve, and filters', async ({
  page,
}) => {
  await page.goto('/sign-in');
  await page.getByTestId('demo-sign-in-jordan').click();
  // Two seeded issues are open, visible from any page once signed in.
  await expect(page.getByTestId('nav-issues-badge').first()).toHaveText('2');
  await page.getByTestId('nav-issues').click();
  const screen = page.getByTestId('screen-issues');
  await expect(screen).toBeVisible();
  await expect(page.getByTestId('issues-filter-open')).toHaveText('Open · 2');

  // A preset needs no text.
  await page.getByTestId('flag-issue').click();
  await page.getByTestId('raise-issue-submit').click();
  await expect(page.getByTestId('raise-issue-error')).toHaveText(
    'Choose what kind of issue this is.',
  );
  await page.getByTestId('issue-category-temperature').click();
  await expect(page.getByTestId('issue-category-temperature')).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await page.getByTestId('raise-issue-submit').click();
  await expect(screen.getByTestId('issue-ISS-007')).toContainText('Temperature alarm');
  await expect(screen.getByTestId('issue-ISS-007')).toContainText('Morning · ');
  await expect(page.getByTestId('nav-issues-badge').first()).toHaveText('3');

  // Other must be written in.
  await page.getByTestId('flag-issue').click();
  await page.getByTestId('issue-category-other').click();
  await page.getByTestId('raise-issue-submit').click();
  await expect(page.getByText('Describe the issue.')).toBeVisible();
  await page.getByTestId('raise-issue-details-field').fill('Forklift charger cable frayed');
  await page.getByTestId('raise-issue-submit').click();
  await expect(screen.getByTestId('issue-ISS-008')).toContainText('Forklift charger cable frayed');

  // Resolving moves it out of Open and records who resolved it.
  await page.getByTestId('resolve-issue-ISS-008').click();
  await page.getByTestId('confirm-resolve-ISS-008').click();
  await expect(screen.getByTestId('issue-ISS-008')).toHaveCount(0);
  await expect(page.getByTestId('issues-filter-open')).toHaveText('Open · 3');
  await page.getByTestId('issues-filter-resolved').click();
  await expect(
    screen.getByTestId('issue-ISS-008').getByLabel('Resolved by Jordan Lee'),
  ).toBeVisible();
  await page.getByTestId('issues-filter-all').click();
  await expect(page.getByTestId('issues-filter-all')).toHaveText('All · 8');
});

test('a photo added while raising an issue is one line with the raise, not two', async ({
  page,
}) => {
  await page.goto('/sign-in');
  await page.getByTestId('demo-sign-in-jordan').click();
  await page.getByTestId('nav-issues').click();
  const trail = page.getByTestId('issue-trail-ISS-001');
  // The trail shows initials and the time, not "Raised by"; the full name is the label.
  await expect(trail.getByLabel('Raised by Avery Smith')).toHaveText('AS');
  await expect(trail).not.toContainText('Raised by');
  await expect(trail).not.toContainText('photo');
  await expect(trail).not.toContainText('Photo added');
  await expect(trail.getByLabel(/Raised by/)).toHaveCount(1);
});
