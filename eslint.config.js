// https://docs.expo.dev/guides/using-eslint/
const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const reactNative = require('eslint-plugin-react-native');

// Tokens only (AGENTS.md): styles read colors and sizes from the theme.
// eslint-plugin-react-native only inspects StyleSheet.create and inline style props, not the
// makeStyles() factory, so the selectors below catch literals anywhere in src/.
const COLOR_LITERAL = String.raw`/^(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()/`;
const COLOR_KEY = String.raw`/[cC]olor$/`;
const SCALE_KEY = String.raw`/^((padding|margin)(Top|Bottom|Left|Right|Horizontal|Vertical|Start|End)?|gap|rowGap|columnGap|borderRadius|fontSize|lineHeight|fontWeight|minHeight|minWidth)$/`;

const tokensOnly = [
  {
    selector: `Literal[value=${COLOR_LITERAL}]`,
    message: 'No color literals. Use a semantic color from the theme (t.color.*).',
  },
  {
    selector: `Property[key.name=${COLOR_KEY}] > Literal[value!='transparent']`,
    message: 'No color literals. Use a semantic color from the theme (t.color.*).',
  },
  {
    selector: `Property[key.name=${SCALE_KEY}] > Literal[value!='auto']`,
    message:
      'No raw spacing, radius, or type values. Use the theme scales (t.spacing, t.radius, t.fontSize, t.fontWeight, t.size).',
  },
];

module.exports = defineConfig([
  globalIgnores(['dist/*', '.expo/*', 'node_modules/*', 'src/design-system/tokens/generated/*']),
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'react-native': reactNative },
    rules: {
      'react-native/no-color-literals': 'error',
      'react-native/no-inline-styles': 'error',
      'no-restricted-syntax': ['error', ...tokensOnly],
    },
  },
]);
