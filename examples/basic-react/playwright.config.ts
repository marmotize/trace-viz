import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  expect: {
    timeout: process.env.CI ? 15_000 : 10_000,
  },
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { height: 720, width: 1280 },
      },
    },
  ],
  reporter: process.env.CI ? 'list' : 'html',
  retries: process.env.CI ? 2 : 0,
  testDir: './e2e',
  timeout: process.env.CI ? 60_000 : 30_000,
  trace: 'on-first-retry',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  webServer: {
    command: process.env.CI
      ? 'pnpm preview --port 5173 --strictPort --host 127.0.0.1'
      : 'pnpm dev',
    reuseExistingServer: !process.env.CI,
    timeout: process.env.CI ? 30_000 : 120_000,
    url: 'http://127.0.0.1:5173',
  },
  workers: process.env.CI ? 1 : undefined,
});
