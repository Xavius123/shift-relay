import { expect, test } from '@playwright/test';

import { openSignIn } from './nav';
import { expectSession, signOutFromHeader } from './session';

test('Shift Manager and Operations Manager demo accounts expose the correct roles', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByTestId('sign-in-gate')).toBeVisible();
  await expect(page.getByTestId('header-sign-out')).toHaveCount(0);

  await expect(page.getByTestId('demo-account-jordan')).toContainText('Morning Shift Manager');
  await expect(page.getByTestId('demo-account-avery')).toContainText('Night Shift Manager');
  await expect(page.getByTestId('demo-account-elena')).toContainText('Operations Manager');
  await expect(page.getByTestId('demo-account-samira')).toHaveCount(0);

  // Elena lands on the Dashboard, which carries her weekly numbers; there is no Overview page.
  await page.getByTestId('demo-sign-in-elena').click();
  await expect(page.getByTestId('screen-dashboard')).toBeVisible();
  await expect(page.getByTestId('manager-week')).toContainText('Awaiting Night');
  await expect(page.getByTestId('nav-overview')).toHaveCount(0);
  await expectSession(page, 'Elena Ruiz');
  await expectSession(page, 'Operations Manager');
  await page.getByTestId('nav-issues').click();
  await expect(page.getByTestId('issues-observer')).toBeVisible();
  await expect(page.getByTestId('resolve-issue-ISS-001')).toHaveCount(0);
  await expect(page.getByTestId('flag-issue')).toHaveCount(0);

  await openSignIn(page);
  await expect(page.getByTestId('demo-sign-in-elena')).toHaveAttribute('aria-disabled', 'true');

  // Sign out sits at the top right of the header and returns to the gate.
  await signOutFromHeader(page);
  await expect(page.getByTestId('side-nav')).toHaveCount(0);
  await expect(page.getByTestId('bottom-nav')).toHaveCount(0);

  await page.getByTestId('demo-sign-in-jordan').click();
  await expect(page.getByTestId('screen-dashboard')).toBeVisible();
  await expectSession(page, 'Jordan Lee');
  await expect(page.getByTestId('manager-week')).toHaveCount(0);
});

test('every sign-in lands on the Dashboard, even from a deep link', async ({ page }) => {
  await page.goto('/logs');
  await expect(page.getByTestId('sign-in-gate')).toBeVisible();
  await expect(page.getByTestId('screen-logs')).toHaveCount(0);

  await page.getByTestId('demo-sign-in-avery').click();
  await expect(page.getByTestId('screen-dashboard')).toBeVisible();
  await expect(page).toHaveURL(/\/$/);

  await signOutFromHeader(page);
  await expect(page.getByTestId('screen-dashboard')).toHaveCount(0);
});
