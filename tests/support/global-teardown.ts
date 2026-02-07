/**
 * Global Teardown for Playwright Tests
 *
 * Runs once after all tests to:
 * 1. Clean up shared test data (admin user)
 * 2. Clean up test artifacts
 * 3. Close any open handles
 */

import { FullConfig, chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig): Promise<void> {
  console.log('🔧 Running global teardown...');

  // ============================================
  // 1. Clean Up Shared Admin User
  // ============================================
  console.log('🧹 Cleaning up shared admin user...');

  const browser = await chromium.launch();
  const authPath = path.resolve(__dirname, '../.auth/admin.json');
  const context = await browser.newContext({
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    ...(fs.existsSync(authPath) ? { storageState: authPath } : {}),
  });

  try {
    const page = await context.newPage();

    // Delete the shared admin user via API
    const response = await page.request.delete('/api/users/admin@test.com');

    if (response.ok() || response.status() === 404) {
      console.log('✅ Cleaned up shared admin user');
    } else {
      console.warn('⚠️  Failed to cleanup admin user, manual cleanup may be needed');
    }
  } catch (error) {
    console.warn('⚠️  Error during admin user cleanup:', error);
  } finally {
    await browser.close();
  }

  // ============================================
  // 2. Clean Up Auth Files
  // ============================================

  // ============================================
  // 3. Clean Up Empty Directories
  // ============================================
  const testResultsDir = path.resolve(__dirname, '../test-results');

  if (fs.existsSync(testResultsDir)) {
    // Check if directory is empty
    const files = fs.readdirSync(testResultsDir);

    if (files.length === 0) {
      fs.rmdirSync(testResultsDir);
      console.log('🗑️  Removed empty test-results directory');
    } else {
      console.log(`📁 Kept test-results with ${files.length} items`);
    }
  }

  // ============================================
  // 4. Print Test Summary
  // ============================================
  console.log('\n📊 Test Run Complete:');
  console.log('   See test-results/ for HTML report');
  console.log('✅ Global teardown complete.\n');
}

export default globalTeardown;
