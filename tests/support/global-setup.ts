/**
 * Global Setup for Playwright Tests
 *
 * Runs once before all tests to:
 * 1. Validate environment variables
 * 2. Create shared test data (admin user)
 * 3. Set up authentication state for reuse
 * 4. Create test artifacts directories
 */

import { FullConfig, chromium } from '@playwright/test';
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
  // 4. Create Shared Admin User and Auth State
  // ============================================
  console.log('👤 Setting up shared admin user...');

  const browser = await chromium.launch();
  const context = await browser.newContext({
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  });
  const page = await context.newPage();

  try {
    // Create admin user via API
    const adminUser = {
      email: 'admin@test.com',
      password: 'Test1234!',
      name: 'Test Admin',
      role: 'admin',
      emailVerified: true,
    };

    const response = await page.request.post('/api/users', {
      data: adminUser,
    });

    if (response.ok()) {
      console.log('✅ Created shared admin user');

      // Login and save authentication state
      await page.goto('/login');
      await page.fill('[data-testid="email"]', adminUser.email);
      await page.fill('[data-testid="password"]', adminUser.password);
      await page.click('[data-testid="login-submit"]');

      // Wait for successful login (redirect to dashboard)
      await page.waitForURL('**/dashboard', { timeout: 10000 });

      // Save authentication state for all tests to reuse
      const authDir = path.resolve(__dirname, '../.auth');
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
      }

      await context.storageState({
        path: path.resolve(authDir, 'admin.json'),
      });

      console.log('🔐 Saved admin authentication state');
    } else {
      console.warn('⚠️  Failed to create admin user, tests may run without shared auth');
    }
  } catch (error) {
    console.warn('⚠️  Error setting up admin user:', error);
    console.warn('   Tests will run without shared authentication state');
  } finally {
    await browser.close();
  }

  // ============================================
  // 5. Validate Database Connection (Optional)
  // ============================================
  if (process.env.DATABASE_URL) {
    console.log('📊 Database URL configured, tests can use direct DB access if needed.');
  }

  // ============================================
  // 6. Print Configuration Summary
  // ============================================
  console.log('\n📋 Test Configuration:');
  console.log(`   Base URL: ${process.env.BASE_URL || 'http://localhost:3000'}`);
  console.log(`   Environment: ${process.env.TEST_ENV || 'local'}`);
  console.log(`   Browser: ${config.projects[0]?.name || 'chromium'}`);
  console.log('✅ Global setup complete.\n');
}

export default globalSetup;
