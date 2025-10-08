import { expect, test } from '@playwright/test';

test.describe('Complete Orchestration Flow - Happy Paths', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?test=1', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('app-ready').waitFor({
      state: 'attached',
      timeout: process.env.CI ? 60_000 : 10_000,
    });
  });

  test('flow-happy-v1: Process V1 trace through complete pipeline', async ({
    page,
  }) => {
    await page.getByTestId('btn-v1').click();

    // Wait for success
    await expect(page.getByTestId('flag-isSuccess')).toContainText('true');

    // Verify version detected
    await expect(page.getByTestId('version')).toHaveText('1');

    // Verify correct visualizer rendered
    await expect(page.getByTestId('viz-v1')).toBeVisible();
    await expect(page.getByTestId('viz-v1')).toContainText(
      'HTTP GET /api/users',
    );

    // Verify no error
    await expect(page.getByTestId('flag-isError')).toContainText('false');
  });

  test('flow-happy-v2: Process V2 trace through complete pipeline', async ({
    page,
  }) => {
    await page.getByTestId('btn-v2').click();

    // Wait for success
    await expect(page.getByTestId('flag-isSuccess')).toContainText('true');

    // Verify version detected
    await expect(page.getByTestId('version')).toHaveText('2');

    // Verify correct visualizer rendered
    await expect(page.getByTestId('viz-v2')).toBeVisible();
    await expect(page.getByTestId('viz-v2')).toContainText('LLM Completion');

    // Verify no error
    await expect(page.getByTestId('flag-isError')).toContainText('false');
  });

  test('flow-complete-cycle: Process both traces sequentially', async ({
    page,
  }) => {
    // V1 first
    await page.getByTestId('btn-v1').click();
    await expect(page.getByTestId('flag-isSuccess')).toContainText('true');
    await expect(page.getByTestId('viz-v1')).toBeVisible();

    // V2 second
    await page.getByTestId('btn-v2').click();
    await expect(page.getByTestId('flag-isSuccess')).toContainText('true');
    await expect(page.getByTestId('viz-v2')).toBeVisible();
    await expect(page.getByTestId('viz-v1')).not.toBeVisible();
  });
});
