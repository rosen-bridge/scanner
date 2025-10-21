import pluginJs from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import vitestPlugin from '@vitest/eslint-plugin';
import prettier from 'eslint-config-prettier';
import pluginCheckFile from 'eslint-plugin-check-file';
import globals from 'globals';

export default [
  {
    // General Ignore Patterns
    ignores: ['**/dist/*', '**/node_modules/*', '**/coverage/*'],
  },
  pluginJs.configs.recommended,
  {
    files: ['packages/**/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      // Base Configuration for JS/TS Files
      parser: typescriptParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Node-Specific Globals
        ...globals.node,
        ...vitestPlugin.environments.env.globals,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'check-file': pluginCheckFile,
      vitest: vitestPlugin,
    },
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        {
          '**/!(*-migration).{js,ts,jsx,tsx}': 'CAMEL_CASE',
        },
        { ignoreMiddleExtensions: true },
      ],
      // vitest Rules
      ...vitestPlugin.configs.recommended.rules,
      ...typescriptEslint.configs.recommended.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error'],
    },
  },
  // Integrate Prettier for Formatting
  prettier,
];
