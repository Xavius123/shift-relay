import { expect, type Locator, test } from '@playwright/test';

import { openDesignSystem } from './nav';
import { openAs } from './session';

// The theme comes from tokens and Redux. Switching the scheme re-themes the app.
const LIGHT_BG = 'rgb(246, 247, 247)'; // ink.50
const DARK_BG = 'rgb(21, 33, 38)'; // ink.950

const background = (locator: Locator) =>
  locator.evaluate((el) => getComputedStyle(el).backgroundColor);

test('dark toggle changes the background, and it carries across screens', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await openAs(page, '/');
  await openDesignSystem(page);
  const screen = page.getByTestId('screen-design-system');
  await expect(screen).toBeVisible();
  expect(await background(screen)).toBe(LIGHT_BG);

  await page.getByTestId('scheme-dark').click();
  await expect.poll(() => background(screen)).toBe(DARK_BG);

  // Redux state, not per-screen state: the dashboard is dark too.
  await page.getByTestId('nav-dashboard').click();
  await expect.poll(() => background(page.getByTestId('screen-dashboard'))).toBe(DARK_BG);
});

test('light is the default and System follows the device setting', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await openAs(page, '/design-system');
  const screen = page.getByTestId('screen-design-system');
  await expect.poll(() => background(screen)).toBe(LIGHT_BG);
  await expect(page.getByTestId('scheme-light')).toHaveAttribute('aria-checked', 'true');

  await page.getByTestId('scheme-system').click();
  await expect.poll(() => background(screen)).toBe(DARK_BG);

  await page.getByTestId('scheme-light').click();
  await expect.poll(() => background(screen)).toBe(LIGHT_BG);
});
