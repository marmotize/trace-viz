import { expect, test } from '@playwright/test';

test.describe('Transformation/Preparation Coverage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?test=1', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('app-ready').waitFor({
      state: 'attached',
      timeout: process.env.CI ? 60_000 : 10_000,
    });
  });

  test('transform-success-v1: Preparer validates V1 trace', async ({
    page,
  }) => {
    await expect(page.getByTestId('control-preparer-enabled')).toBeChecked();

    await page.getByTestId('btn-v1').click();

    await expect(page.getByTestId('flag-isSuccess')).toContainText('true');
    await expect(page.getByTestId('viz-v1')).toBeVisible();
  });

  test('transform-error-invalid-v2: Invalid trace succeeds without validation', async ({
    page,
  }) => {
    await expect(page.getByTestId('control-preparer-enabled')).toBeChecked();

    await page.getByTestId('preset-invalid-v2').click();

    await expect(page.getByTestId('flag-isSuccess')).toContainText('true');
  });

  test('transform-disabled-direct-trace: Bypass preparer', async ({ page }) => {
    await page.getByTestId('control-preparer-enabled').uncheck();
    await page.getByTestId('btn-v1').click();

    await expect(page.getByTestId('flag-isSuccess')).toContainText('true');
    await expect(page.getByTestId('viz-v1')).toBeVisible();
  });
});
