import { expect, type Page } from '@playwright/test';

/** The signed-in user shows once in the nav: the side nav when wide, the drawer on phones. */
export async function expectSession(page: Page, text: string | RegExp) {
  const side = page.getByTestId('shell-session');
  if (await page.getByTestId('side-nav').isVisible()) {
    await expect(side).toContainText(text);
    return;
  }
  await page.locator('[data-testid="menu-button"]:visible').click();
  await expect(page.getByTestId('drawer-session')).toContainText(text);
  await page.getByTestId('menu-close').click();
}

type DemoAccount = 'jordan' | 'avery' | 'elena';

/** Sign-in is required. Open `path`, sign in at the gate, and stay on `path`. */
export async function openAs(page: Page, path: string, account: DemoAccount = 'jordan') {
  await page.goto(path);
  await page.getByTestId(`demo-sign-in-${account}`).click();
  await expect(page.getByTestId('sign-in-gate')).toHaveCount(0);
}

/** Sign out from the top-right of the current section's header. */
export async function signOutFromHeader(page: Page) {
  await page.locator('[data-testid="header-sign-out"]:visible').click();
  await expect(page.getByTestId('sign-in-gate')).toBeVisible();
}
