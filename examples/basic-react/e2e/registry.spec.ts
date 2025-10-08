import { expect, test } from '@playwright/test';

test.describe('Registry Lookup Coverage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?test=1', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('app-ready').waitFor({
      state: 'attached',
      timeout: process.env.CI ? 60_000 : 10_000,
    });
  });

  test('registry-default-used: Default visualizer when no match', async ({
    page,
  }) => {
    await page.getByTestId('control-clear-registry').click();
    await page.getByTestId('control-register-default').click();
    await page.getByTestId('preset-v2-9-0').click();

    await expect(page.getByTestId('flag-isSuccess')).toContainText('true');
    await expect(page.getByTestId('viz-v1')).toBeVisible();
  });

  test('registry-no-visualizer-error: Error when no visualizer', async ({
    page,
  }) => {
    await page.getByTestId('control-clear-registry').click();
    await page.getByTestId('preset-v2-9-0').click();

    await expect(page.getByTestId('flag-isError')).toContainText('true');
  });
});
