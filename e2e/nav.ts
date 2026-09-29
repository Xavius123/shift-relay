import type { Page } from '@playwright/test';

/** Design system sits in the side nav when wide and in the drawer on phones, not the tabs. */
export async function openDesignSystem(page: Page) {
  if (await page.getByTestId('side-nav').isVisible()) {
    await page.getByTestId('nav-design-system').click();
    return;
  }
  await page.locator('[data-testid="menu-button"]:visible').click();
  await page.getByTestId('drawer-nav-design-system').click();
}
