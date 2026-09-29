import { expect, test } from '@playwright/test';
import { openAs } from './session';

// Every component, variant, size, and state from the specs' Verify lines.
const textVariants = ['heading', 'title', 'body', 'bodySm', 'caption'];
const buttonVariants = ['primary', 'secondary', 'outline', 'ghost', 'danger'];
const sizes = ['sm', 'md', 'lg'];
const statusVariants = ['default', 'accent', 'success', 'error', 'warning', 'info'];

test.beforeEach(async ({ page }) => {
  await openAs(page, '/design-system');
  await expect(page.getByTestId('screen-design-system')).toBeVisible();
});

test('every component, variant, and size is on the design system screen', async ({ page }) => {
  const ids = [
    ...textVariants.map((v) => `text-${v}`),
    ...buttonVariants.flatMap((v) => sizes.map((s) => `button-${v}-${s}`)),
    'button-disabled',
    'button-loading',
    'card-default',
    'card-elevated',
    'card-interactive',
    ...statusVariants.map((v) => `badge-${v}`),
    'input-default',
    'input-error',
    'input-disabled',
  ];
  for (const id of ids) {
    const el = page.getByTestId(id);
    await el.scrollIntoViewIfNeeded();
    await expect(el, id).toBeVisible();
  }
});

test('Text: heading and title are headers', async ({ page }) => {
  await expect(page.getByTestId('text-heading')).toHaveAttribute('role', 'heading');
  await expect(page.getByTestId('text-title')).toHaveAttribute('role', 'heading');
});

test('Button: pressing increments; disabled and loading do not', async ({ page }) => {
  const counter = page.getByTestId('button-counter');
  await page.getByTestId('button-primary-md').click();
  await expect(counter).toHaveText('Pressed 1 times');

  await page.getByTestId('button-disabled').click({ force: true });
  await page.getByTestId('button-loading').click({ force: true });
  await expect(counter).toHaveText('Pressed 1 times');
  await expect(page.getByTestId('button-disabled')).toHaveAttribute('aria-disabled', 'true');
  await expect(page.getByTestId('button-loading')).toHaveAttribute('aria-busy', 'true');
});

test('Button: md and lg meet the 44px touch target', async ({ page }) => {
  for (const id of ['button-primary-md', 'button-primary-lg']) {
    const box = await page.getByTestId(id).boundingBox();
    expect(box?.height, id).toBeGreaterThanOrEqual(44);
  }
});

test('Card: interactive is a pressable button', async ({ page }) => {
  const card = page.getByTestId('card-interactive');
  await expect(card).toHaveAttribute('role', 'button');
  await card.click();
  await expect(page.getByTestId('card-counter')).toHaveText('Pressed 1 times');
});

test('Badge: max overflow shows {max}+', async ({ page }) => {
  await expect(page.getByTestId('badge-max')).toHaveText('99+');
});

test('Input: typing updates the value; error is announced; disabled is not editable', async ({
  page,
}) => {
  await page.getByTestId('input-default-field').fill('rota');
  await expect(page.getByTestId('input-echo')).toHaveText('Value: rota');

  await expect(page.getByTestId('input-error').getByRole('alert')).toHaveText(
    'Use a number, like 49.',
  );
  await expect(page.getByTestId('input-disabled-field')).not.toBeEditable();
});
