/**
 * Global Setup for Playwright Tests
 *
 * Runs once before all tests to:
 * 1. Validate environment variables
 * 2. Seed test data if needed
 * 3. Set up authentication state
 */

import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalSetup(config: FullConfig): Promise<void> {
  console.log('🔧 Running global setup for Playwright tests...');

  // ============================================
  // 1. Validate Required Environment Variables
  // ============================================
  const requiredEnvVars = ['BASE_URL'];
  const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

  if (missingVars.length > 0) {
    console.warn(
      `⚠️  Warning: Missing environment variables: ${missingVars.join(', ')}. Tests may fail.`,
    );
  }

  // ============================================
  // 2. Create Test Artifacts Directory
  // ============================================
  const artifactsDir = path.resolve(__dirname, '../test-results');
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
    console.log(`📁 Created test artifacts directory: ${artifactsDir}`);
  }

  // ============================================
  // 3. Set Up Authentication Storage Directory
  // ============================================
  const authDir = path.resolve(__dirname, '../.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
    console.log(`🔐 Created auth storage directory: ${authDir}`);
  }

  // ============================================
  // 4. Validate Database Connection (Optional)
  // ============================================
  if (process.env.DATABASE_URL) {
    console.log('📊 Database URL configured, tests can use direct DB access if needed.');
  }

  // ============================================
  // 5. Print Configuration Summary
  // ============================================
  console.log('\n📋 Test Configuration:');
  console.log(`   Base URL: ${process.env.BASE_URL || 'http://localhost:3000'}`);
  console.log(`   Environment: ${process.env.TEST_ENV || 'local'}`);
  console.log(`   Browser: ${config.projects[0]?.name || 'chromium'}`);
  console.log('✅ Global setup complete.\n');
}

export default globalSetup;
