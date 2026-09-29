import { expect, test } from '@playwright/test';

import { openDesignSystem, openSignIn } from './nav';

// Sign-in is required: signed out shows only the gate; signed in, every top-level screen renders.
test('all top-level screens render after sign-in', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('sign-in-gate')).toBeVisible();
  await expect(page.getByTestId('side-nav')).toHaveCount(0);
  await expect(page.getByTestId('bottom-nav')).toHaveCount(0);

  await page.getByTestId('demo-sign-in-jordan').click();
  await expect(page.getByTestId('screen-dashboard')).toBeVisible();

  await page.getByTestId('nav-logs').click();
  await expect(page.getByTestId('screen-logs')).toBeVisible();

  await openDesignSystem(page);
  await expect(page.getByTestId('screen-design-system')).toBeVisible();

  await openSignIn(page);
  await expect(page.getByTestId('screen-sign-in')).toBeVisible();
});
