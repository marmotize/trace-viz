import type { TestRunnerConfig } from '@storybook/test-runner';

const config: TestRunnerConfig = {
  async preVisit(page) {
    await page.waitForLoadState('networkidle');
  },
};

export default config;
