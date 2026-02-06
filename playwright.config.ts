import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

/**
 * Playwright Test Configuration for image_analyzer
 *
 * Production-ready config with:
 * - Environment-aware base URL
 * - Multi-browser support (Chromium, Firefox, WebKit)
 * - Smart artifact retention (only on failure)
 * - Parallel execution optimized for CI
 * - Multiple reporters (HTML, JUnit, JSON)
 */
export default defineConfig({
  // ============================================
  // PROJECT & DIRECTORY CONFIGURATION
  // ============================================
  testDir: path.resolve(__dirname, 'tests'),
  testMatch: '**/*.spec.ts',
  outputDir: path.resolve(__dirname, 'tests/test-results/artifacts'),
  snapshotDir: path.resolve(__dirname, 'tests/snapshots'),

  // ============================================
  // TIMEOUTS (per-architected standards)
  // ============================================
  timeout: 60 * 1000, // 60 seconds per test
  expect: {
    timeout: 10 * 1000, // 10 seconds for assertions
  },
  // ============================================
  // REPORTERS
  // ============================================
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'tests/test-results/junit-report.xml' }],
    ['json', { outputFile: 'tests/test-results/json-report.json' }],
    ['list'], // Console output
  ],

  // ============================================
  // BROWSER CONFIGURATION
  // ============================================
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile testing
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
    // API-only tests (no browser)
    {
      name: 'api',
      use: {
        baseURL: process.env.API_URL || 'http://localhost:3000/api',
        // No browser dependencies for API tests
      },
    },
  ],

  // ============================================
  // BASE URL CONFIGURATION
  // ============================================
  use: {
    headless: true,
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    // Screenshot on failure (configured below)
    screenshot: 'only-on-failure',
    // Video on failure
    video: 'retain-on-failure',
    // Trace on failure (for debugging)
    trace: 'retain-on-failure',
    // Locale settings
    locale: 'en-US',
    // Timezone
    timezoneId: 'America/New_York',
    actionTimeout: 15 * 1000, // 15 seconds for actions
    navigationTimeout: 30 * 1000, // 30 seconds for navigation
  },

  // ============================================
  // PARALLEL EXECUTION
  // ============================================
  fullyParallel: true, // Run all tests in parallel
  workers: process.env.CI ? 4 : undefined, // CI-tuned workers

  // ============================================
  // RETRY CONFIGURATION
  // ============================================
  retries: process.env.CI ? 2 : 0, // More retries in CI

  // ============================================
  // GLOBAL SETUP & TEARDOWN
  // ============================================
  globalSetup: path.resolve(__dirname, 'tests/support/global-setup.ts'),
  globalTeardown: path.resolve(__dirname, 'tests/support/global-teardown.ts'),

  // ============================================
  // SHARDING (CI-optimized)
  // ============================================
  shard: process.env.SHARD
    ? {
        current: parseInt(process.env.SHARD.split('/')[0], 10),
        total: parseInt(process.env.SHARD.split('/')[1], 10),
      }
    : undefined,

  // ============================================
  // FORBIDDEN PATTERNS
  // ============================================
  forbidOnly: !!process.env.CI, // Fail if test.only in CI
  grep: /.*/,
});
