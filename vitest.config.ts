import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    // Single source of truth for unit/integration tests
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    include: [
      'tests/unit/**/*.test.{ts,tsx}',
      'tests/unit/**/*.spec.{ts,tsx}',
      'src/features/**/*.test.{ts,tsx}',
      'src/**/*.test.{ts,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/tests/e2e/**',
      '**/tests/api/**',
      // Skip tests that require external services or real database
      '**/tests/unit/lib/r2.test.ts',
      '**/tests/unit/lib/replicate.test.ts',
      '**/tests/unit/lib/creem.test.ts',
      '**/tests/unit/lib/api.test.ts',
      '**/tests/unit/lib/auth.test.ts',
      '**/tests/unit/api/upload-route.test.ts',
      '**/tests/unit/account-deletion-service.test.ts',
      '**/tests/unit/batch-analysis-service.test.ts',
      '**/tests/unit/task-2.1-users-schema.test.ts',
      '**/src/lib/db/db.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
