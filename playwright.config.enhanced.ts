/**
 * Enhanced Playwright Configuration for Concurrent Testing
 *
 * This configuration implements the concurrent testing strategy from
 * test-design-architecture.md#L533-L553
 *
 * Key improvements over base config:
 * - Separate projects for API and E2E tests
 * - Worker isolation for E2E tests
 * - Fully parallel API tests
 * - Optimized timeout settings
 *
 * Usage:
 * - Merge this config into playwright.config.ts
 * - Or use as reference for configuration decisions
 *
 * @see test-design-architecture.md#L533-L553
 */

import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Base Configuration
 */
export default defineConfig({
  // ============================================
  // PROJECT & DIRECTORY CONFIGURATION
  // ============================================
  testDir: path.resolve(__dirname, 'tests'),
  outputDir: path.resolve(__dirname, 'tests/test-results'),
  snapshotDir: path.resolve(__dirname, 'tests/snapshots'),

  // ============================================
  // TIMEOUTS (aligned with test-design-architecture.md)
  // ============================================
  timeout: 60 * 1000, // 60s per test (matches Replicate API timeout)
  expect: {
    timeout: 10 * 1000, // 10s for assertions
  },
  actionTimeout: 15 * 1000, // 15s for actions
  navigationTimeout: 30 * 1000, // 30s for navigation

  // ============================================
  // REPORTERS
  // ============================================
  reporter: [
    ['html', {
      outputFolder: 'tests/test-results/html-report',
      open: 'never'
    }],
    ['junit', {
      outputFile: 'tests/test-results/junit-report.xml'
    }],
    ['json', {
      outputFile: 'tests/test-results/json-report.json'
    }],
    ['list'], // Console output
  ],

  // ============================================
  // PARALLEL EXECUTION STRATEGY
  // ============================================
  fullyParallel: false, // Default to false, override per project

  // ============================================
  // RETRY CONFIGURATION
  // ============================================
  retries: process.env.CI ? 1 : 0, // Retry once in CI for network flakiness

  // ============================================
  // GLOBAL SETUP & TEARDOWN
  // ============================================
  globalSetup: path.resolve(__dirname, 'tests/support/global-setup.ts'),
  globalTeardown: path.resolve(__dirname, 'tests/support/global-teardown.ts'),

  // ============================================
  // PROJECT CONFIGURATIONS
  // ============================================
  projects: [
    // ----------------------------------------
    // PROJECT 1: API Tests (Fully Parallel)
    // ----------------------------------------
    {
      name: 'api-tests',
      testMatch: /tests\/api\/.*\.spec\.ts/,
      fullyParallel: true, // ✅ API tests can run fully parallel
      workers: process.env.CI ? 4 : 2, // 4 workers in CI, 2 locally

      use: {
        baseURL: process.env.API_URL || 'http://localhost:3000/api',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
      },

      // API tests don't need browsers
      testIgnore: /tests\/e2e\/.*\.spec\.ts/,
    },

    // ----------------------------------------
    // PROJECT 2: E2E Tests (Controlled Parallel)
    // ----------------------------------------
    {
      name: 'e2e-chromium',
      testMatch: /tests\/e2e\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
        trace: 'retain-on-failure',
        video: 'on-first-failure',
        screenshot: 'only-on-failure',
      },
      fullyParallel: false, // ⚠️ File-level parallel only
      workers: process.env.CI ? 2 : 1, // ⚠️ Conservative: 2 files max
    },

    // ----------------------------------------
    // PROJECT 3: E2E Firefox (for cross-browser testing)
    // ----------------------------------------
    {
      name: 'e2e-firefox',
      testMatch: /tests\/e2e\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Firefox'],
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
      },
      fullyParallel: false,
      workers: 1, // Run sequentially on Firefox
    },

    // ----------------------------------------
    // PROJECT 4: Mobile E2E (for responsive testing)
    // ----------------------------------------
    {
      name: 'e2e-mobile',
      testMatch: /tests\/e2e\/.*\.spec\.ts/,
      use: {
        ...devices['Pixel 5'],
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
      },
      fullyParallel: false,
      workers: 1,
    },
  ],

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

// ============================================
// TYPE Augmentation for Custom Fixtures
// ============================================
declare global {
  namespace PlaywrightTest {
    interface UseOptions {
      // Custom options here
    }
  }
}

// ============================================
// CONCURRENT TESTING STRATEGY NOTES
// ============================================

/**
 * STRATEGY OVERVIEW:
 *
 * API Tests (api-tests project):
 * - fullyParallel: true ✅
 * - workers: 4 (CI) / 2 (local)
 * - Rationale: API tests are fast and don't share browser state
 * - Risk: Low (using dbTransaction fixture for isolation)
 *
 * E2E Tests (e2e-chromium project):
 * - fullyParallel: false (file-level only)
 * - workers: 2 (CI) / 1 (local)
 * - Rationale: Prevents data race conditions between tests
 * - Risk: Medium (using testUserId and dbTransaction for isolation)
 *
 * Mobile/Cross-Browser:
 * - workers: 1
 * - Rationale: Limited resources, sequential execution
 *
 * RISK MITIGATION:
 * 1. Use dbTransaction fixture for database isolation
 * 2. Use unique testUserId per test
 * 3. Clear cookies/localStorage in afterEach hook
 * 4. Use testRunId for data tagging and cleanup
 *
 * REFERENCE: test-design-architecture.md#L495-L527
 */
