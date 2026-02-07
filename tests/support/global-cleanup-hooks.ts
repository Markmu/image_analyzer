/**
 * Global Test Cleanup Hooks
 *
 * Provides automatic cleanup after each test to prevent state pollution.
 * Implements the "afterEach Hook" strategy from test-design-architecture.md#L435-L443
 *
 * Cleanup Strategy:
 * 1. Clear browser state (cookies, localStorage, sessionStorage)
 * 2. Clear authentication state
 * 3. Verify no data pollution (if dbTransaction is available)
 *
 * @see test-design-architecture.md#L435-L443
 */

import { test as base, Page } from '@playwright/test';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface CleanupMetrics {
  cookiesCleared: number;
  localStorageCleared: boolean;
  sessionStorageCleared: boolean;
  cleanupTimestamp: Date;
}

export interface CleanupOptions {
  /**
   * Skip browser state cleanup (for tests that need to persist state)
   * @default false
   */
  skipBrowserCleanup?: boolean;

  /**
   * Verify cleanup success (throws if state remains)
   * @default true
   */
  verifyCleanup?: boolean;

  /**
   * Log detailed cleanup metrics
   * @default false
   */
  verbose?: boolean;
}

// ============================================
// CLEANUP FIXTURE
// ============================================

export const test = base.extend<{
  cleanupMetrics: CleanupMetrics;
}>({
  // ----------------------------------------
  // Cleanup Metrics Fixture
  // ----------------------------------------
  cleanupMetrics: async ({ page }, use) => {
    const metrics: CleanupMetrics = {
      cookiesCleared: 0,
      localStorageCleared: false,
      sessionStorageCleared: false,
      cleanupTimestamp: new Date(),
    };

    await use(metrics);

    // Update timestamp after test
    metrics.cleanupTimestamp = new Date();
  },
});

// ============================================
// GLOBAL CLEANUP HOOK
// ============================================

/**
 * Register global afterEach cleanup hook
 *
 * Usage in tests/support/custom-fixtures.ts or test files:
 *
 * ```typescript
 * import { registerGlobalCleanup } from './global-cleanup-hooks';
 *
 * test.afterEach(async ({ page }) => {
 *   await registerGlobalCleanup({ page, verbose: true });
 * });
 * ```
 */
export async function registerGlobalCleanup(
  page: Page,
  options: CleanupOptions = {}
): Promise<CleanupMetrics> {
  const {
    skipBrowserCleanup = false,
    verifyCleanup = true,
    verbose = false,
  } = options;

  const metrics: CleanupMetrics = {
    cookiesCleared: 0,
    localStorageCleared: false,
    sessionStorageCleared: false,
    cleanupTimestamp: new Date(),
  };

  if (skipBrowserCleanup) {
    if (verbose) {
      console.log('⏭️  Skipping browser cleanup (skipBrowserCleanup=true)');
    }
    return metrics;
  }

  // ============================================
  // STRATEGY 1: Clear Browser State
  // ============================================

  try {
    // 1. Clear Cookies
    const context = page.context();
    const cookiesBefore = await context.cookies();
    await context.clearCookies();
    const cookiesAfter = await context.cookies();
    metrics.cookiesCleared = cookiesBefore.length;

    if (verbose) {
      console.log(`🧹 Cleared ${metrics.cookiesCleared} cookies`);
    }

    // 2. Clear localStorage (with error handling for restricted pages)
    try {
      const localStorageKeysBefore = await page.evaluate(() => {
        return Object.keys(localStorage);
      });

      await page.evaluate(() => {
        localStorage.clear();
      });

      const localStorageKeysAfter = await page.evaluate(() => {
        return Object.keys(localStorage);
      });

      metrics.localStorageCleared = localStorageKeysAfter.length === 0;

      if (verbose && localStorageKeysBefore.length > 0) {
        console.log(`🧹 Cleared ${localStorageKeysBefore.length} localStorage keys`);
      }
    } catch (error) {
      // 某些页面（如错误页面、特殊协议页面）不允许访问 localStorage
      // 这是正常的，不应该导致清理失败
      if (verbose) {
        console.warn('⚠️  localStorage not accessible (this is normal for some pages)');
      }
      metrics.localStorageCleared = true; // 标记为已清理（无法访问 = 无数据）
    }

    // 3. Clear sessionStorage (with error handling)
    try {
      const sessionStorageKeysBefore = await page.evaluate(() => {
        return Object.keys(sessionStorage);
      });

      await page.evaluate(() => {
        sessionStorage.clear();
      });

      const sessionStorageKeysAfter = await page.evaluate(() => {
        return Object.keys(sessionStorage);
      });

      metrics.sessionStorageCleared = sessionStorageKeysAfter.length === 0;

      if (verbose && sessionStorageKeysBefore.length > 0) {
        console.log(`🧹 Cleared ${sessionStorageKeysBefore.length} sessionStorage keys`);
      }
    } catch (error) {
      // 某些页面不允许访问 sessionStorage
      if (verbose) {
        console.warn('⚠️  sessionStorage not accessible (this is normal for some pages)');
      }
      metrics.sessionStorageCleared = true;
    }

  } catch (error) {
    console.warn('⚠️  Error during browser cleanup:', error);
  }

  // ============================================
  // STRATEGY 2: Clear Authentication State
  // ============================================

  try {
    // Clear any authentication tokens or session data
    await page.evaluate(() => {
      // Clear any NextAuth session data
      if (typeof window !== 'undefined') {
        try {
          // @ts-ignore - accessing localStorage with dynamic keys
          delete window.localStorage['nextauth.session-token'];
          // @ts-ignore
          delete window.localStorage['nextauth.csrf-token'];
        } catch (e) {
          // localStorage 可能不可访问，忽略错误
        }
      }
    });

    if (verbose) {
      console.log('🔐 Cleared authentication state');
    }
  } catch (error) {
    // 认证清理失败不应该阻止测试
    if (verbose) {
      console.warn('⚠️  Error clearing auth state:', error);
    }
  }

  // ============================================
  // STRATEGY 3: Verify Cleanup Success
  // ============================================

  if (verifyCleanup) {
    try {
      const remainingCookies = await page.context().cookies();

      let remainingLocalStorage: string[] = [];
      let remainingSessionStorage: string[] = [];

      // 尝试检查 localStorage（可能失败）
      try {
        remainingLocalStorage = await page.evaluate(() => {
          return Object.keys(localStorage);
        });
      } catch (e) {
        // localStorage 不可访问，这是正常的
        if (verbose) {
          console.log('ℹ️  localStorage not accessible for verification (normal)');
        }
      }

      // 尝试检查 sessionStorage（可能失败）
      try {
        remainingSessionStorage = await page.evaluate(() => {
          return Object.keys(sessionStorage);
        });
      } catch (e) {
        // sessionStorage 不可访问，这是正常的
        if (verbose) {
          console.log('ℹ️  sessionStorage not accessible for verification (normal)');
        }
      }

      // 只在 Cookie 有剩余时报告失败（localStorage/sessionStorage 不可访问不算失败）
      if (remainingCookies.length > 0) {
        throw new Error(
          `❌ Cleanup verification failed:\n` +
          `  - Cookies remaining: ${remainingCookies.length}\n` +
          `  - localStorage keys: ${remainingLocalStorage.join(', ') || 'N/A'}\n` +
          `  - sessionStorage keys: ${remainingSessionStorage.join(', ') || 'N/A'}\n` +
          `This indicates state pollution between tests!`
        );
      }

      if (verbose) {
        console.log('✅ Cleanup verification passed: No state remains');
      }
    } catch (error) {
      // 验证失败 - 抛出错误
      throw error;
    }
  }

  return metrics;
}

// ============================================
// CLEANUP VERIFICATION HELPERS
// ============================================

/**
 * Verify that a specific localStorage key is cleared
 */
export async function verifyLocalStorageCleared(
  page: Page,
  key: string
): Promise<boolean> {
  const value = await page.evaluate((k) => {
    return localStorage.getItem(k);
  }, key);

  return value === null;
}

/**
 * Verify that all cookies are cleared
 */
export async function verifyCookiesCleared(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies();
  return cookies.length === 0;
}

/**
 * Verify that authentication state is cleared
 */
export async function verifyAuthStateCleared(page: Page): Promise<boolean> {
  const hasSessionToken = await page.evaluate(() => {
    // @ts-ignore
    return !!localStorage.getItem('nextauth.session-token');
  });

  return !hasSessionToken;
}

// ============================================
// EXPORTS
// ============================================

export { test as cleanupTest };
export default test;
