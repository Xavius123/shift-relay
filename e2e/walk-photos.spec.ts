import { expect, test, type Page } from '@playwright/test';

import { openSignIn } from './nav';
import { openAs } from './session';

// On web the picker is a file input, so a fixture image stands in for the camera.
const fixture = 'assets/favicon-shift-relay.png';

async function choosePhoto(page: Page) {
  const chooser = page.waitForEvent('filechooser');
  await page.getByTestId('sheet-take-photo').click();
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
  for (const name of ['Restock status checked']) {
    await page.getByRole('switch', { name }).click();
  }
  await page.getByTestId('sign-off-log').click();
  await expect(modal).toHaveCount(0);

  // The saved photo stays on the signed log, read-only.
  await page.getByTestId('shift-card-morning').click();
  await expect(modal.getByTestId('walk-photo')).toHaveCount(1);
  await expect(modal.getByTestId('sheet-choose-photos')).toHaveCount(0);
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
  await expect(modal.getByTestId('walk-photos-count')).toContainText(/(Take|Upload) photos/);
  await expect(modal.getByTestId('walk-no-photos')).toBeVisible();
  await expect(modal.getByTestId('sheet-take-photo')).toBeVisible();
});

test("photos: each Shift Manager's own forms are open, and the Operations Manager's are all open", async ({
  page,
}) => {
  // Night closes: Avery can add to Midday and Night, but not to Morning.
  await openAs(page, '/', 'avery');
  await page.getByTestId('shift-card-morning').click();
  await expect(page.getByTestId('shift-log-modal').getByTestId('sheet-take-photo')).toHaveCount(0);
  await page.getByTestId('close-shift-log').click();
  await page.getByTestId('shift-card-night').click();
  await expect(page.getByTestId('shift-log-modal').getByTestId('sheet-take-photo')).toBeVisible();
  await page.getByTestId('close-shift-log').click();

  await openSignIn(page);
  await page.getByTestId('demo-sign-in-elena').click();
  // The Operations Manager can add to any of the day's open forms, including Morning.
  for (const phase of ['morning', 'midday', 'night']) {
    await page.getByTestId(`shift-card-${phase}`).click();
    await expect(page.getByTestId('shift-log-modal').getByTestId('sheet-take-photo')).toBeVisible();
    await page.getByTestId('close-shift-log').click();
  }
});

test('narrow: the camera tab always asks which shift the photo is for', async ({ page }, info) => {
  test.skip(info.project.name !== 'phone', 'bottom tabs are for phones');
  // Avery has two open forms, Midday and Night, so the tab asks which one the photo is for.
  await openAs(page, '/', 'avery');
  await page.getByTestId('nav-camera').click();
  await expect(page.getByTestId('camera-choose')).toBeVisible();
  await expect(page.getByTestId('camera-choose-morning')).toHaveCount(0);
  await expect(page.getByTestId('camera-choose-midday')).toBeVisible();
  await page.getByTestId('camera-choose-cancel').click();
  await expect(page.getByTestId('camera-choose')).toHaveCount(0);

  // Choosing Night sends the photo to Night, not to the first open form.
  await page.getByTestId('nav-camera').click();
  let chooser = page.waitForEvent('filechooser');
  await page.getByTestId('camera-choose-night').click();
  await (await chooser).setFiles(fixture);
  await expect(page.getByTestId('camera-notice')).toContainText('Saved to the Night shift');

  // Take another photo goes to the same shift; this time it is Midday.
  await page.getByTestId('camera-notice-close').click();
  await page.getByTestId('nav-camera').click();
  chooser = page.waitForEvent('filechooser');
  await page.getByTestId('camera-choose-midday').click();
  await (await chooser).setFiles(fixture);
  // It saves straight to Midday and stays put; the shift then shows it as a saved photo.
  await expect(page.getByTestId('camera-notice')).toContainText('Saved to the Midday shift');
  await page.getByTestId('camera-notice-open').click();
  const modal = page.getByTestId('shift-log-modal');
  await expect(modal).toContainText('Midday');
  await expect(modal.getByTestId('walk-photo')).toHaveCount(1);
  await expect(modal.getByTestId('walk-draft')).toHaveCount(0);
  await page.getByTestId('close-shift-log').click();

  // Elena, the Operations Manager, is offered every open form that day.
  await openSignIn(page);
  await page.getByTestId('demo-sign-in-elena').click();
  await page.getByTestId('nav-camera').click();
  for (const phase of ['morning', 'midday', 'night']) {
    await expect(page.getByTestId(`camera-choose-${phase}`)).toBeVisible();
  }
  chooser = page.waitForEvent('filechooser');
  await page.getByTestId('camera-choose-morning').click();
  await (await chooser).setFiles(fixture);
  await expect(page.getByTestId('camera-notice')).toContainText('Saved to the Morning shift');
  await page.getByTestId('camera-notice-open').click();
  const morning = page.getByTestId('shift-log-modal');
  await expect(morning).toContainText('Morning');
  await expect(morning.getByTestId('walk-photo')).toHaveCount(1);
});

test('narrow: with only one open form the camera tab still asks', async ({ page }, info) => {
  test.skip(info.project.name !== 'phone', 'bottom tabs are for phones');
  await openAs(page, '/', 'jordan');
  await page.getByTestId('next-action-button').click();
  const check = page.getByRole('switch', { name: 'Restock status checked' });
  await check.click();
  await expect(check).toHaveAttribute('aria-checked', 'true');
  await page.getByTestId('sign-off-log').click();
  await expect(page.getByTestId('shift-log-modal')).toHaveCount(0);

  // Morning is signed off and closed, so Midday is Jordan's only open form.
  await page.getByTestId('nav-camera').click();
  await expect(page.getByTestId('camera-choose')).toBeVisible();
  await expect(page.getByTestId('camera-choose-midday')).toBeVisible();
  await expect(page.getByTestId('camera-choose-morning')).toHaveCount(0);
});

test('inside a shift sheet a pinned camera bar takes photos; closed forms have none', async ({
  page,
}) => {
  await openAs(page, '/', 'jordan');
  await page.getByTestId('shift-card-midday').click();
  const modal = page.getByTestId('shift-log-modal');
  await expect(modal.getByTestId('sheet-camera-bar')).toBeVisible();
  const chooser = page.waitForEvent('filechooser');
  await modal.getByTestId('sheet-take-photo').click();
  await (await chooser).setFiles(fixture);
  await expect(modal.getByTestId('walk-draft')).toHaveCount(1);
  await page.getByTestId('close-shift-log').click();

  // Elena can add photos to any open form, so the bar is there for her too.
  await openSignIn(page);
  await page.getByTestId('demo-sign-in-elena').click();
  await page.getByTestId('shift-card-midday').click();
  await expect(page.getByTestId('sheet-camera-bar')).toBeVisible();
  await page.getByTestId('close-shift-log').click();

  // A signed-off form is closed, for everyone: Jordan's Morning has no bar once signed.
  await openSignIn(page);
  await page.getByTestId('demo-sign-in-jordan').click();
  await page.getByTestId('next-action-button').click();
  const check = page.getByRole('switch', { name: 'Restock status checked' });
  await check.click();
  await expect(check).toHaveAttribute('aria-checked', 'true');
  await page.getByTestId('sign-off-log').click();
  await page.getByTestId('shift-card-morning').click();
  await expect(page.getByTestId('sheet-camera-bar')).toHaveCount(0);
});

test('every finished shift has one or two shift photos, including the mouse', async ({ page }) => {
  await openAs(page, '/photos', 'avery');
  const screen = page.getByTestId('screen-walk-photos');
  await expect(page.getByTestId('walk-review-total')).toHaveText('77 photos across 22 days');
  // Yesterday: two on the Morning shift, one at Midday, one at Night.

  const yesterday = screen.locator('[data-testid^="walk-review-day-"]').nth(1);
  const shifts = yesterday.locator('[data-testid^="walk-review-shift-"]');
  await expect(shifts.nth(0).getByTestId('walk-review-photo')).toHaveCount(2);
  await expect(shifts.nth(1).getByTestId('walk-review-photo')).toHaveCount(1);
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
  for (const shift of [0, 1, 2]) {
    await expect(secondDayShifts.nth(shift).getByTestId('walk-review-photo')).toHaveCount(1);
  }

  // Every past day (all but today, the first) has at least one photo. The list renders in
  // windows, so scroll to the end and record each day as it appears.
  // Each pass reads the whole window in one page.evaluate, so a row that the list unmounts
  // mid-read cannot break the test.
  const withPhotos = new Set<string>();
  const emptyShifts = new Map<string, number>();
  const seen = new Set<string>();
  const box = await screen.boundingBox();
  if (box) await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  for (let pass = 0; pass < 20 && seen.size < 22; pass += 1) {
    const window = await screen.evaluate((root) =>
      [...root.querySelectorAll('[data-testid^="walk-review-day-"]')].map((day) => ({
        id: day.getAttribute('data-testid') ?? '',
        photos: day.querySelectorAll('[data-testid="walk-review-photo"]').length,
        empty: day.querySelectorAll('[data-testid="walk-review-no-photos"]').length,
      })),
    );
    for (const day of window) {
      seen.add(day.id);
      if (day.photos > 0) withPhotos.add(day.id);
      emptyShifts.set(day.id, day.empty);
    }
    await page.mouse.wheel(0, 1500);
    await page.waitForTimeout(300);
  }
  expect(seen.size).toBe(22);
  // Today is the only day without photos, and its three shifts are the only empty ones.
  expect(withPhotos.size).toBe(21);
  expect([...emptyShifts.values()].reduce((sum, count) => sum + count, 0)).toBe(3);
});

test('photos record where they came from: uploads are tagged, camera photos are not', async ({
  page,
}, info) => {
  const phone = info.project.name === 'phone';
  await openAs(page, '/', 'jordan');
  await page.getByTestId('next-action-button').click();
  const modal = page.getByTestId('shift-log-modal');

  // A phone offers a camera and a library; a desktop browser only offers an upload.
  await expect(modal.getByTestId('sheet-take-photo')).toContainText(
    phone ? 'Take photo' : 'Upload photos',
  );
  await expect(modal.getByTestId('sheet-choose-photos')).toHaveCount(phone ? 1 : 0);

  // The primary button: a camera photo on a phone, an upload on desktop.
  let chooser = page.waitForEvent('filechooser');
  await modal.getByTestId('sheet-take-photo').click();
  await (await chooser).setFiles(fixture);
  await modal.getByTestId('walk-save-photos').click();
  await expect(modal.getByTestId('walk-photo')).toHaveCount(1);
  await expect(modal.getByTestId('walk-photo-uploaded')).toHaveCount(phone ? 0 : 1);

  if (phone) {
    // A photo picked from the library is an upload.
    chooser = page.waitForEvent('filechooser');
    await modal.getByTestId('sheet-choose-photos').click();
    await (await chooser).setFiles(fixture);
    await modal.getByTestId('walk-save-photos').click();
    await expect(modal.getByTestId('walk-photo')).toHaveCount(2);
    await expect(modal.getByTestId('walk-photo-uploaded')).toHaveCount(1);
  }

  // The full-size viewer says so too.
  await modal.getByTestId('walk-photo-open').last().click();
  await expect(page.getByTestId('photo-preview-uploaded')).toBeVisible();
});

test('Dashboard shift cards show small previews of the photos taken, not a description', async ({
  page,
}) => {
  await openAs(page, '/', 'jordan');
  const card = page.getByTestId('shift-card-morning');
  await expect(card).not.toContainText('Check restock status');
  await expect(page.getByTestId('shift-card-morning-photos')).toHaveCount(0);

  // A saved photo appears as a thumbnail.
  await page.getByTestId('next-action-button').click();
  await choosePhoto(page);
  await page.getByTestId('walk-save-photos').click();
  await expect(page.getByTestId('walk-photo')).toHaveCount(1);
  // An unsaved photo appears too, marked as a draft.
  await choosePhoto(page);
  await page.getByTestId('close-shift-log').click();
  await expect(card.getByTestId('shift-card-photo')).toHaveCount(1);
  await expect(card.getByTestId('shift-card-photo-draft')).toHaveCount(1);
  await expect(card).toHaveAttribute('aria-label', /2 photos/);
});
