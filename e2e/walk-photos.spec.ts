import { expect, test, type Page } from '@playwright/test';

import { openSignIn } from './nav';
import { openAs } from './session';

// On web the picker is a file input, so a fixture image stands in for the camera.
const fixture = 'assets/favicon-shift-relay.png';

async function choosePhoto(page: Page) {
  const chooser = page.waitForEvent('filechooser');
  await page.getByTestId('walk-choose-photos').click();
  await (await chooser).setFiles(fixture);
}

async function switchTo(page: Page, account: 'jordan' | 'avery' | 'elena') {
  await openSignIn(page);
  await page.getByTestId(`demo-sign-in-${account}`).click();
}

/** Jordan takes one photo on the Morning shift and saves it, then closes the sheet. */
async function saveOneMorningPhoto(page: Page) {
  await page.goto('/sign-in');
  await page.getByTestId('demo-sign-in-jordan').click();
  await page.getByTestId('next-action-button').click();
  await choosePhoto(page);
  await page.getByTestId('walk-save-photos').click();
  await expect(page.getByTestId('walk-photo')).toHaveCount(1);
  await page.getByTestId('close-shift-log').click();
}

test('walk flow: take photos, review them, save them, then close the shift', async ({ page }) => {
  await page.goto('/sign-in');
  await page.getByTestId('demo-sign-in-jordan').click();
  await page.getByTestId('next-action-button').click();

  const modal = page.getByTestId('shift-log-modal');
  const walk = modal.getByTestId('walk-photos');
  await expect(walk).toContainText('Shift Photos');
  await expect(modal.getByTestId('walk-no-photos')).toBeVisible();

  // Take: photos wait for review; nothing is saved yet.
  await choosePhoto(page);
  await choosePhoto(page);
  await expect(modal.getByTestId('walk-draft')).toHaveCount(2);
  await expect(modal.getByTestId('walk-photo')).toHaveCount(0);
  await expect(modal.getByTestId('walk-no-photos')).toHaveCount(0);

  // Review: open one full size, then remove the other.
  await modal.getByTestId('walk-draft-open').first().click();
  await expect(page.getByTestId('photo-preview')).toContainText('not saved');
  await expect(page.getByTestId('photo-preview-delete')).toHaveCount(0);
  await page.getByTestId('photo-preview-close').click();
  await modal.getByTestId('walk-draft-remove').last().click();
  await expect(modal.getByTestId('walk-drafts-count')).toHaveText('Review 1 photo');

  // The shift can't close with unsaved photos.
  await page.getByTestId('sign-off-log').click();
  await expect(page.getByTestId('log-validation-error')).toContainText(
    'Save or remove your 1 unsaved shift photo before signing off.',
  );

  // Save: the photo joins the log, and Shift Managers can no longer delete it.
  await page.getByTestId('walk-save-photos').click();
  await expect(modal.getByTestId('walk-photo')).toHaveCount(1);
  await expect(modal.getByTestId('walk-drafts')).toHaveCount(0);
  await expect(modal.getByTestId('walk-photos-count')).toHaveText('1 photo saved to this log');
  await expect(modal.getByTestId('walk-photo').first()).toContainText('JL');
  await modal.getByTestId('walk-photo-open').first().click();
  await expect(page.getByTestId('photo-preview-actor')).toHaveText('Jordan Lee');
  await expect(page.getByTestId('photo-preview-delete')).toHaveCount(0);
  await page.getByTestId('photo-preview-close').click();

  // Close the shift: the checks, then sign off.
  for (const name of [
    'Night notes reviewed',
    'Restock status checked',
    'Carry-over priorities assigned',
  ]) {
    await page.getByRole('switch', { name }).click();
  }
  await page.getByTestId('sign-off-log').click();
  await expect(modal).toHaveCount(0);

  // The saved photo stays on the signed log, read-only.
  await page.getByTestId('shift-card-morning').click();
  await expect(modal.getByTestId('walk-photo')).toHaveCount(1);
  await expect(modal.getByTestId('walk-choose-photos')).toHaveCount(0);
});

test('everyone can review shift photos by day and shift; only the Operations Manager deletes', async ({
  page,
}) => {
  await saveOneMorningPhoto(page);

  // A Shift Manager sees the page and the photo, without Delete.
  await expect(page.getByTestId('nav-photos')).toContainText('Shift Photos');
  await page.getByTestId('nav-photos').click();
  const screen = page.getByTestId('screen-walk-photos');
  const today = screen.locator('[data-testid^="walk-review-day-"]').first();
  await expect(today).toContainText('Today');
  await expect(today.locator('[data-testid^="walk-review-shift-"]')).toHaveCount(3);
  await expect(today.getByTestId('walk-review-photo')).toHaveCount(1);
  // Midday and Night have none, so they show the placeholder.
  await expect(today.getByTestId('walk-review-no-photos')).toHaveCount(2);
  await today.getByTestId('walk-review-photo').click();
  await expect(page.getByTestId('photo-preview')).toContainText('Morning shift');
  await expect(page.getByTestId('photo-preview-delete')).toHaveCount(0);
  await page.getByTestId('photo-preview-close').click();

  // Elena can delete, after confirming.
  await switchTo(page, 'elena');
  await page.getByTestId('nav-photos').click();
  await screen.getByTestId('walk-review-photo').first().click();
  await page.getByTestId('photo-preview-delete').click();
  await page.getByTestId('photo-preview-delete-cancel').click();
  await expect(page.getByTestId('photo-preview')).toBeVisible();
  await page.getByTestId('photo-preview-delete').click();
  await page.getByTestId('photo-preview-delete-confirm').click();
  await expect(page.getByTestId('photo-preview')).toHaveCount(0);
  // Today's Morning is back to the placeholder; the seeded history is untouched.
  await expect(today.getByTestId('walk-review-photo')).toHaveCount(0);
  await expect(today.getByTestId('walk-review-no-photos')).toHaveCount(3);
});

test('a walk with no photos shows the placeholder', async ({ page }) => {
  // Today's Midday is open to Jordan for photos even before Morning is signed.
  await openAs(page, '/', 'jordan');
  await page.getByTestId('shift-card-midday').click();
  const modal = page.getByTestId('shift-log-modal');
  await expect(modal.getByTestId('walk-photos-count')).toContainText('Take photos');
  await expect(modal.getByTestId('walk-no-photos')).toBeVisible();
  await expect(modal.getByTestId('walk-take-photo')).toBeVisible();
});

test("photos: each Shift Manager's forms are open, Elena's are not", async ({ page }) => {
  // Night closes: Avery can add to Midday and Night, but not to Morning.
  await openAs(page, '/', 'avery');
  await page.getByTestId('shift-card-morning').click();
  await expect(page.getByTestId('shift-log-modal').getByTestId('walk-take-photo')).toHaveCount(0);
  await page.getByTestId('close-shift-log').click();
  await page.getByTestId('shift-card-night').click();
  await expect(page.getByTestId('shift-log-modal').getByTestId('walk-take-photo')).toBeVisible();
  await page.getByTestId('close-shift-log').click();

  await openSignIn(page);
  await page.getByTestId('demo-sign-in-elena').click();
  await page.getByTestId('shift-card-midday').click();
  await expect(page.getByTestId('shift-log-modal').getByTestId('walk-take-photo')).toHaveCount(0);
});

test('Shift Photos shortcut adds photos to the current form, then opens it to review', async ({
  page,
}) => {
  await openAs(page, '/photos', 'jordan');
  await expect(page.getByTestId('add-photos-card')).toContainText('Morning');
  const chooser = page.waitForEvent('filechooser');
  await page.getByTestId('add-photos-choose').click();
  await (await chooser).setFiles(fixture);
  await expect(page.getByTestId('shift-log-modal').getByTestId('walk-draft')).toHaveCount(1);
});

test('narrow: the camera tab is open for a Shift Manager and opens the current form', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'phone', 'bottom tabs are for phones');
  // Avery is not up yet (Morning is unsigned), but Midday is his first open form.
  await openAs(page, '/', 'avery');
  await expect(page.getByTestId('nav-camera')).toBeEnabled();
  await page.getByTestId('nav-camera').click();
  const modal = page.getByTestId('shift-log-modal');
  await expect(modal).toContainText('Midday');
  await expect(modal.getByTestId('walk-take-photo')).toBeVisible();
  await page.getByTestId('close-shift-log').click();

  await openSignIn(page);
  await page.getByTestId('demo-sign-in-elena').click();
  await expect(page.getByTestId('nav-camera')).toBeDisabled();
});

test('each past day has one to three shift photos, including the mouse', async ({ page }) => {
  await openAs(page, '/photos', 'avery');
  const screen = page.getByTestId('screen-walk-photos');
  await expect(page.getByTestId('walk-review-total')).toHaveText('42 photos across 22 days');
  // Yesterday: two on the Morning shift, none at Midday, one at Night.
  const yesterday = screen.locator('[data-testid^="walk-review-day-"]').nth(1);
  const shifts = yesterday.locator('[data-testid^="walk-review-shift-"]');
  await expect(shifts.nth(0).getByTestId('walk-review-photo')).toHaveCount(2);
  await expect(shifts.nth(1).getByTestId('walk-review-no-photos')).toBeVisible();
  await expect(shifts.nth(2).getByTestId('walk-review-photo')).toHaveCount(1);

  await shifts.nth(0).getByTestId('walk-review-photo').first().click();
  await expect(page.getByTestId('photo-preview-caption')).toHaveText('Walk-in cooler');
  await expect(page.getByTestId('photo-preview-actor')).toHaveText('Jordan Lee');
  await page.getByTestId('photo-preview-next').click();
  await expect(page.getByTestId('photo-preview-caption')).toHaveText('Storage aisle');
  await page.getByTestId('photo-preview-close').click();
  await shifts.nth(2).getByTestId('walk-review-photo').click();
  await expect(page.getByTestId('photo-preview-caption')).toHaveText('Mouse on duty');
  await page.getByTestId('photo-preview-close').click();

  const twoDaysAgo = screen.locator('[data-testid^="walk-review-day-"]').nth(2);
  const secondDayShifts = twoDaysAgo.locator('[data-testid^="walk-review-shift-"]');
  await expect(secondDayShifts.nth(0).getByTestId('walk-review-no-photos')).toBeVisible();
  await expect(secondDayShifts.nth(1).getByTestId('walk-review-photo')).toHaveCount(1);
  await expect(secondDayShifts.nth(2).getByTestId('walk-review-no-photos')).toBeVisible();

  // Every past day (all but today, the first) has at least one photo. The list renders in
  // windows, so scroll to the end and record each day as it appears.
  const days = screen.locator('[data-testid^="walk-review-day-"]');
  const withPhotos = new Set<string>();
  const seen = new Set<string>();
  for (let pass = 0; pass < 12 && seen.size < 22; pass += 1) {
    const count = await days.count();
    for (let index = 0; index < count; index += 1) {
      const day = days.nth(index);
      const id = (await day.getAttribute('data-testid')) ?? '';
      seen.add(id);
      if ((await day.getByTestId('walk-review-photo').count()) > 0) withPhotos.add(id);
    }
    await days.last().scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 1500);
    await page.waitForTimeout(300);
  }
  expect(seen.size).toBe(22);
  // Today is the only day without photos.
  expect(withPhotos.size).toBe(21);
});
