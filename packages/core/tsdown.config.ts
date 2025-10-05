import { defineConfig } from 'tsdown';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts'],
  external: [],
  format: ['esm'],
  minify: false,
  sourcemap: true,
  target: 'es2021',
  treeshake: true,
});
