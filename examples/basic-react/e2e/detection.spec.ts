import { expect, test } from '@playwright/test';

test.describe('Version Detection Coverage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?test=1');
    await expect(page.getByTestId('app-ready')).toBeAttached();
  });

  test('detect-missing-version-fallback: Use fallback when version missing', async ({
    page,
  }) => {
    await page.getByTestId('preset-no-version').click();

    await expect(page.getByTestId('flag-isSuccess')).toContainText('true');
    await expect(page.getByTestId('version')).toHaveText('1');
    await expect(page.getByTestId('viz-v1')).toBeVisible();
  });

  test('detect-semver-2-1-3: Handle semantic versioning', async ({ page }) => {
    await page.getByTestId('control-register-2-1').click();
    await page.getByTestId('preset-v21-3').click();

    await expect(page.getByTestId('flag-isSuccess')).toContainText('true');
    await expect(page.getByTestId('version')).toHaveText('2.1.3');
    await expect(page.getByTestId('viz-v2')).toBeVisible();
  });

  test('detect-semver-fallback-major: Semantic version fallback to major', async ({
    page,
  }) => {
    await page.getByTestId('preset-v2-9-0').click();

    await expect(page.getByTestId('flag-isSuccess')).toContainText('true');
    await expect(page.getByTestId('version')).toHaveText('2.9.0');
    await expect(page.getByTestId('viz-v2')).toBeVisible();
  });
});
