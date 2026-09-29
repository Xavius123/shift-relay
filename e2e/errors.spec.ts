import { expect, test } from '@playwright/test';

import { openDesignSystem } from './nav';

test('simulated failure: a failed raise shows an error, keeps the form, and adds nothing', async ({
  page,
}) => {
  await page.goto('/sign-in');
  await page.getByTestId('demo-sign-in-jordan').click();
  await expect(page.getByTestId('nav-issues-badge').first()).toHaveText('2');

  await openDesignSystem(page);
  await page.getByTestId('simulate-network-failure').click();
  await expect(page.getByTestId('simulate-network-failure')).toContainText('On');

  await page.getByTestId('nav-issues').click();
  await page.getByTestId('flag-issue').click();
  await page.getByTestId('issue-category-temperature').click();
  await page.getByTestId('raise-issue-submit').click();

  await expect(page.getByTestId('raise-issue-error')).toBeVisible();
  await expect(page.getByTestId('issue-category-temperature')).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await expect(page.getByTestId('issue-ISS-007')).toHaveCount(0);
  await expect(page.getByTestId('nav-issues-badge').first()).toHaveText('2');
});
