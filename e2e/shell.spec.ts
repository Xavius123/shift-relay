import { expect, test } from '@playwright/test';

import { openAs } from './session';

// The app shell: side nav on wide screens, bottom tabs on phones, a themed header per section.
const DARK_BG = 'rgb(21, 33, 38)'; // ink.950

test('wide: side nav switches sections and marks the current one', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'side nav is for wide screens');
  await openAs(page, '/');
  await expect(page.getByTestId('side-nav')).toBeVisible();
  await expect(page.getByTestId('bottom-nav')).toHaveCount(0);
  await expect(page.getByTestId('menu-button')).toHaveCount(0);
  await expect(page.getByTestId('nav-dashboard')).toHaveAttribute('aria-selected', 'true');

  await page.getByTestId('nav-logs').click();
  await expect(page.getByTestId('screen-logs')).toBeVisible();
  await expect(page.getByTestId('nav-logs')).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('nav-dashboard')).toHaveAttribute('aria-selected', 'false');

  await page.getByTestId('nav-design-system').click();
  await expect(page.getByTestId('screen-design-system')).toBeVisible();
  await expect(page).toHaveURL(/\/design-system$/);
});

test('narrow: bottom tabs sit under the content', async ({ page }, info) => {
  test.skip(info.project.name !== 'phone', 'bottom tabs are for phones');
  await openAs(page, '/');
  await expect(page.getByTestId('screen-dashboard')).toBeVisible();
  const nav = page.getByTestId('bottom-nav');
  await expect(nav).toBeVisible();
  await expect(page.getByTestId('side-nav')).toHaveCount(0);
  await expect(page.locator('[data-testid="menu-button"]:visible')).toBeVisible();

  const box = await nav.boundingBox();
  const viewport = page.viewportSize();
  expect(box && viewport && box.y + box.height).toBeCloseTo(viewport?.height ?? 0, -1);

  // Design system is drawer-only on phones.
  await expect(nav.getByTestId('nav-design-system')).toHaveCount(0);
  await page.locator('[data-testid="menu-button"]:visible').click();
  await page.getByTestId('drawer-nav-design-system').click();
  await expect(page.getByTestId('screen-design-system')).toBeVisible();
});

test('narrow: hamburger opens the side navigation drawer', async ({ page }, info) => {
  test.skip(info.project.name !== 'phone', 'drawer is for narrow screens');
  await openAs(page, '/');
  await expect(page.getByTestId('screen-dashboard')).toBeVisible();

  await page.locator('[data-testid="menu-button"]:visible').click();
  const drawer = page.getByTestId('mobile-drawer');
  await expect(drawer).toBeVisible();
  await expect(page.getByTestId('drawer-nav-dashboard')).toHaveAttribute('aria-selected', 'true');

  await page.getByTestId('drawer-nav-logs').click();
  await expect(page.getByTestId('screen-logs')).toBeVisible();
  await expect(drawer).toHaveCount(0);
  await expect(page.getByTestId('bottom-nav')).toBeVisible();
});

test('opening a shift log stays inside Logs as a modal', async ({ page }) => {
  await openAs(page, '/logs');
  await page.locator('[data-testid^="log-row-"]').first().click();
  await expect(page.getByTestId('shift-log-modal')).toBeVisible();
  await expect(page.getByTestId('nav-logs')).toHaveAttribute('aria-selected', 'true');

  await page.getByTestId('close-shift-log').click();
  await expect(page.getByTestId('shift-log-modal')).toHaveCount(0);
  await expect(page.getByTestId('screen-logs')).toBeVisible();
});

test('header theme toggle switches to dark everywhere', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await openAs(page, '/');
  await expect(page.getByTestId('screen-dashboard')).toBeVisible();
  await page.locator('[data-testid="theme-toggle"]:visible').first().click();
  await expect
    .poll(() =>
      page.getByTestId('screen-dashboard').evaluate((el) => getComputedStyle(el).backgroundColor),
    )
    .toBe(DARK_BG);

  await page.getByTestId('nav-logs').click();
  await expect
    .poll(() =>
      page.getByTestId('screen-logs').evaluate((el) => getComputedStyle(el).backgroundColor),
    )
    .toBe(DARK_BG);
});

test('narrow: no Sign in tab, and the center camera takes a photo for the open shift', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'phone', 'bottom tabs are for phones');
  await openAs(page, '/');
  const nav = page.getByTestId('bottom-nav');
  await expect(nav.getByTestId('nav-sign-in')).toHaveCount(0);

  // Camera is the middle of five: two tabs on each side.
  const camera = nav.getByTestId('nav-camera');
  const boxes = await Promise.all(
    ['nav-logs', 'nav-photos', 'nav-camera', 'nav-issues', 'nav-dashboard'].map((id) =>
      nav.getByTestId(id).boundingBox(),
    ),
  );
  const xs = boxes.map((box) => (box ? box.x : -1));
  expect(xs).toEqual([...xs].sort((a, b) => a - b));

  // The camera tab asks which form the photo is for, then goes to the picker (a file input on
  // web) and saves the photo to that form, staying on the Dashboard.
  await camera.click();
  await expect(page.getByTestId('camera-choose')).toBeVisible();
  const chooser = page.waitForEvent('filechooser');
  await page.getByTestId('camera-choose-morning').click();
  await (await chooser).setFiles('assets/favicon-shift-relay.png');
  await expect(page.getByTestId('camera-notice')).toContainText('Saved to the Morning shift');
  await expect(page.getByTestId('shift-log-modal')).toHaveCount(0);
  await expect(page.getByTestId('screen-dashboard')).toBeVisible();
});
