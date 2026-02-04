/**
 * Global Teardown for Playwright Tests
 *
 * Runs once after all tests to:
 * 1. Clean up test artifacts
 * 2. Close any open handles
 */

import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig): Promise<void> {
  console.log('🔧 Running global teardown...');

  // ============================================
  // 1. Clean Up Empty Directories
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
  // 2. Print Test Summary
  // ============================================
  console.log('\n📊 Test Run Complete:');
  console.log('   See test-results/ for HTML report');
  console.log('✅ Global teardown complete.\n');
}

export default globalTeardown;
