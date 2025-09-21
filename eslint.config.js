import eslintjs from '@eslint/js';
import tseslint from 'typescript-eslint';
import {defineConfig} from 'eslint/config';

export default defineConfig([
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    plugins: {
      eslint: eslintjs,
      typescript: tseslint
    },
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly'
      }
    },
    extends: [
      tseslint.configs.strict,
      eslintjs.configs.recommended
    ]
  },
]);
