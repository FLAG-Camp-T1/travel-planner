import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'public/mockServiceWorker.js']),

  // Public Track: JavaScript + React Basic Checks
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // Allow unused variables in JS files
      'no-unused-vars': 'warn',
    },
  },

  // TS Track: TypeScript Specific Typesafety Checks
  {
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommended],
    rules: {
      // Use TypeScript's no-unused-vars instead of ESLint's
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',

      // Allow usage of 'any' type but warn about it to encourage better typing
      '@typescript-eslint/no-explicit-any': 'warn',

      // Disable the requirement for explicit return types on functions and class methods to reduce verbosity
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
]);
