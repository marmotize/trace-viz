import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      all: true,
      exclude: [
        'src/**/__tests__/**',
        'dist/**',
        'node_modules/**',
        'vitest.config.*',
        '**/*.d.ts',
      ],
      include: ['src/**/*.{ts,tsx}'],
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      thresholds: {
        branches: 80,
        functions: 85,
        lines: 85,
        statements: 85,
      },
    },
    environment: 'node',
  },
});
