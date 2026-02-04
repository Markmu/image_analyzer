/**
 * Merged Fixtures for image_analyzer Test Suite
 *
 * This file combines all Playwright fixtures into a single test object
 * using mergeTests pattern from @seontechnologies/playwright-utils
 *
 * Usage in tests:
 *   import { test, expect } from '../support/merged-fixtures';
 */

import { mergeTests } from '@playwright/test';
import { test as apiRequestFixture } from '@seontechnologies/playwright-utils/api-request/fixtures';
import { test as authFixture } from '@seontechnologies/playwright-utils/auth-session/fixtures';
import { test as recurseFixture } from '@seontechnologies/playwright-utils/recurse/fixtures';
import { test as logFixture } from '@seontechnologies/playwright-utils/log/fixtures';
import { test as interceptFixture } from '@seontechnologies/playwright-utils/intercept-network-call/fixtures';
import { test as networkRecorderFixture } from '@seontechnologies/playwright-utils/network-recorder/fixtures';
import { test as fileUtilsFixture } from '@seontechnologies/playwright-utils/file-utils/fixtures';
import { test as networkErrorMonitorFixture } from '@seontechnologies/playwright-utils/network-error-monitor/fixtures';
import { test as burnInFixture } from '@seontechnologies/playwright-utils/burn-in/fixtures';

// ============================================
// CUSTOM PROJECT FIXTURES
// ============================================

import { test as customFixtures } from './custom-fixtures';

// ============================================
// MERGE ALL FIXTURES
// ============================================

/**
 * Combined test object with all fixtures available
 *
 * Fixtures included:
 * - apiRequest: Typed HTTP client with schema validation
 * - authToken: Authentication token (auto-fetched and persisted)
 * - recurse: Async polling for background jobs
 * - log: Report-integrated logging
 * - interceptNetworkCall: Network spy/stub
 * - networkRecorder: HAR record/playback
 * - fileUtils: CSV/XLSX/PDF validation
 * - networkErrorMonitor: HTTP 4xx/5xx detection
 * - burnIn: Smart test selection for CI
 * + all custom fixtures from custom-fixtures.ts
 */
export const test = mergeTests(
  // Playwright Utils fixtures
  apiRequestFixture,
  authFixture,
  recurseFixture,
  logFixture,
  interceptFixture,
  networkRecorderFixture,
  fileUtilsFixture,
  networkErrorMonitorFixture,
  burnInFixture,
  // Custom project fixtures
  customFixtures,
);

export { expect } from '@playwright/test';
export { APIRequestContext } from '@playwright/test';

// ============================================
// TYPE DEFINITIONS (for IDE autocomplete)
// ============================================

/**
 * All fixtures available after merging
 */
export type TestFixtures = {
  // API Testing
  apiRequest: Awaited<ReturnType<typeof apiRequestFixture>>;
  recurse: Awaited<ReturnType<typeof recurseFixture>>;

  // Authentication
  authToken: string;
  authOptions: {
    userIdentifier?: string;
    environment?: string;
  };

  // Logging & Debugging
  log: {
    step: (name: string, callback: () => Promise<void>) => Promise<void>;
    info: (message: string) => void;
    error: (message: string, error?: unknown) => void;
  };

  // Network Control
  interceptNetworkCall: Awaited<ReturnType<typeof interceptFixture>>;
  networkRecorder: Awaited<ReturnType<typeof networkRecorderFixture>>;
  networkErrorMonitor: Awaited<ReturnType<typeof networkErrorMonitorFixture>>;

  // File Utilities
  fileUtils: Awaited<ReturnType<typeof fileUtilsFixture>>;

  // CI/CD
  burnIn: Awaited<ReturnType<typeof burnInFixture>>;

  // Custom Fixtures
  testUser: {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
  };
  apiClient: {
    get: <T>(path: string) => Promise<{ status: number; body: T }>;
    post: <T>(path: string, data: unknown) => Promise<{ status: number; body: T }>;
    delete: <T>(path: string) => Promise<{ status: number; body: T }>;
  };
};

// ============================================
// CONFIGURATION HELPERS
// ============================================

/**
 * Get the base URL from environment or config
 */
export function getBaseURL(): string {
  return process.env.BASE_URL || 'http://localhost:3000';
}

/**
 * Get the API URL from environment or config
 */
export function getAPIURL(): string {
  return process.env.API_URL || 'http://localhost:3000/api';
}
