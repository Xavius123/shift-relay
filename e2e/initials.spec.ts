import { expect, test } from '@playwright/test';
import { openAs } from './session';

test('signed logs show the initials of everyone who signed them', async ({ page }) => {
  await openAs(page, '/logs');
  await expect(page.getByTestId('screen-logs')).toBeVisible();
  // Yesterday is complete: Morning sent the Midday handoff and Night received it.
  const yesterday = page.locator('[data-testid^="log-day-"]').nth(1);
  const midday = yesterday.locator('[data-testid$="-midday-initials"]');
  await expect(midday.locator('[data-testid$="-initials-0"]')).toHaveText('JL');
  await expect(midday.locator('[data-testid$="-initials-1"]')).toHaveText('AS');
  await expect(yesterday.locator('[data-testid$="-night-initials"]')).toHaveText('AS');
  // Today's logs have no signer yet, so no initials.
  const today = page.locator('[data-testid^="log-day-"]').nth(0);
  await expect(today.locator('[data-testid$="-initials"]')).toHaveCount(0);
});
