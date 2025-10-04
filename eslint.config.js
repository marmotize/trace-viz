import nkzw from '@nkzw/eslint-config';

export default [
  ...nkzw,
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.cache/**'],
  },
  {
    rules: {
      '@typescript-eslint/array-type': [2, { default: 'generic' }],
      'import-x/no-unresolved': 'off',
    },
  },
];
