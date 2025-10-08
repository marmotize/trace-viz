import { expect, test } from '@playwright/test';

test.describe('Concurrency and Abandonment Coverage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?test=1', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('app-ready').waitFor({
      state: 'attached',
      timeout: process.env.CI ? 60_000 : 10_000,
    });
  });

  test('concurrency-abandon-stale: Later operation wins', async ({ page }) => {
    await page.getByTestId('control-preparer-delay-ms').fill('800');

    await page.getByTestId('btn-v1').click();
    await page.waitForTimeout(50);
    await page.getByTestId('btn-v2').click();

    await expect(page.getByTestId('flag-isSuccess')).toContainText('true');
    await expect(page.getByTestId('version')).toHaveText('2');
    await expect(page.getByTestId('viz-v2')).toBeVisible();
    await expect(page.getByTestId('viz-v1')).not.toBeVisible();
  });

  test('concurrency-sequential: Operations complete in order', async ({
    page,
  }) => {
    await page.getByTestId('btn-v1').click();
    await expect(page.getByTestId('flag-isSuccess')).toContainText('true');
    await expect(page.getByTestId('viz-v1')).toBeVisible();

    await page.getByTestId('btn-v2').click();
    await expect(page.getByTestId('flag-isSuccess')).toContainText('true');
    await expect(page.getByTestId('viz-v2')).toBeVisible();
  });
});
