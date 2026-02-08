import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'nextjs-tmp-1/**',
    // Additional ignores (from .eslintignore):
    'node_modules/**',
    'dist/**',
    'coverage/**',
    'playwright-report/**',
    'tests/test-results/**',
    'tests/support/**',
    'tests/mocks/**',
    'tests/e2e/auth/**',
    'scripts/**',
    'playwright.config.enhanced.ts',
    '*.log',
    '.env*',
    '.vscode/**',
    '!.vscode/settings.json',
  ]),
]);

export default eslintConfig;
