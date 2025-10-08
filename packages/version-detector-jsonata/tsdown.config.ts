import { defineConfig } from 'tsdown';

export default defineConfig({
  dts: true,
  entry: ['src/index.ts'],
  external: ['jsonata', '@trace-viz/core'],
  format: 'esm',
});
