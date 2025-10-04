import { defineConfig } from 'tsdown';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts'],
  external: ['react', '@trace-viz/core'],
  format: ['esm'],
  sourcemap: true,
  treeshake: true,
});
