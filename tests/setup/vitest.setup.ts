import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

// Load environment variables from .env.local for integration tests
// This must be done before importing any modules that depend on env vars
import { config } from 'dotenv';
// Load dotenv explicitly to process.env
const envResult = config({
  path: '.env.local',
  // Ensure environment variables are actually loaded into process.env
  processEnv: process.env,
  // Override any existing values
  override: true,
});

if (envResult.error) {
  // If .env.local doesn't exist, we'll use fallback values for unit tests
  console.warn('Warning: .env.local not found, using test environment variables');
}

// Log to verify DATABASE_URL is loaded (remove in production)
if (process.env.DATABASE_URL) {
  console.log('[Setup] DATABASE_URL loaded from .env.local');
} else {
  console.warn('[Setup] DATABASE_URL not available in environment');
}

// Set up other environment variables for testing
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'test-google-client-secret';
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'test-nextauth-secret';
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// Mock R2 Cloudflare
process.env.R2_ACCOUNT_ID = 'test-account-id';
process.env.R2_ACCESS_KEY_ID = 'test-access-key-id';
process.env.R2_SECRET_ACCESS_KEY = 'test-secret-access-key';
process.env.R2_BUCKET_NAME = 'test-bucket';

// NODE_ENV is read-only, so we skip setting it

// Mock localStorage with a working in-memory implementation
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

afterEach(() => {
  cleanup();
});

// Mock next/navigation for tests
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));
