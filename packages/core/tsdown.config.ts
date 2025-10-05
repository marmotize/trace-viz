import { defineConfig } from 'tsdown';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts'],
  external: ['jsonata', 'zod'],
  format: ['esm'],
  minify: false,
  sourcemap: true,
  target: 'es2023',
  treeshake: true,
});
