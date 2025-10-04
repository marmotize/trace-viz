export default {
  importOrderParserPlugins: ['typescript', 'jsx'],
  plugins: [
    '@prettier/plugin-oxc',
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-packagejson',
  ],
  singleQuote: true,
};
