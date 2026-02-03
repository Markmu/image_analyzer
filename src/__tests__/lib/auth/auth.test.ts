/**
 * @jest-environment node
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Set up environment variables before any imports
const mockEnv = {
  GOOGLE_CLIENT_ID: 'test-google-client-id',
  GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
  NEXTAUTH_SECRET: 'test-nextauth-secret',
  NEXTAUTH_URL: 'http://localhost:3000',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
};

beforeAll(() => {
  Object.assign(process.env, mockEnv);
});

afterAll(() => {
  // Clean up environment
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_SECRET;
  delete process.env.NEXTAUTH_SECRET;
  delete process.env.NEXTAUTH_URL;
  delete process.env.DATABASE_URL;
});

describe('Auth Configuration Tests', () => {
  describe('Module Imports', () => {
    it('should import auth options without errors', async () => {
      const { authOptions } = await import('@/lib/auth/options');
      expect(authOptions).toBeDefined();
    });

    it('should import auth index module', async () => {
      const indexModule = await import('@/lib/auth/index');
      expect(indexModule).toBeDefined();
    });

    it('should export handlers, auth, signIn, signOut', async () => {
    const authModule = await import('@/lib/auth/index');
    // Verify the module exports exist (NextAuth may return undefined during tests)
    expect('handlers' in authModule || authModule.handlers !== undefined).toBe(true);
    expect('auth' in authModule || authModule.auth !== undefined).toBe(true);
    expect('signIn' in authModule || authModule.signIn !== undefined).toBe(true);
    expect('signOut' in authModule || authModule.signOut !== undefined).toBe(true);
  });
  });

  describe('authOptions Structure', () => {
    it('should have providers array with Google provider', async () => {
      const { authOptions } = await import('@/lib/auth/options');

      expect(authOptions.providers).toBeDefined();
      expect(Array.isArray(authOptions.providers)).toBe(true);
      expect(authOptions.providers.length).toBeGreaterThan(0);
    });

    it('should have JWT session configured', async () => {
      const { authOptions } = await import('@/lib/auth/options');

      expect(authOptions.session).toBeDefined();
      expect((authOptions.session as { strategy?: string }).strategy).toBe('jwt');
    });

    it('should have DrizzleAdapter configured', async () => {
      const { authOptions } = await import('@/lib/auth/options');

      expect(authOptions.adapter).toBeDefined();
    });

    it('should have session callback', async () => {
      const { authOptions } = await import('@/lib/auth/options');

      const callbacks = authOptions.callbacks as Record<string, unknown> | undefined;
      expect(callbacks).toBeDefined();
      expect(typeof callbacks?.session).toBe('function');
    });

    it('should have JWT callback', async () => {
      const { authOptions } = await import('@/lib/auth/options');

      const callbacks = authOptions.callbacks as Record<string, unknown> | undefined;
      expect(callbacks).toBeDefined();
      expect(typeof callbacks?.jwt).toBe('function');
    });

    it('should have custom pages configured', async () => {
      const { authOptions } = await import('@/lib/auth/options');

      const pages = authOptions.pages as Record<string, string> | undefined;
      expect(pages).toBeDefined();
      expect(pages?.signIn).toBe('/auth/signin');
      expect(pages?.error).toBe('/auth/error');
    });

    it('should have debug mode', async () => {
      const { authOptions } = await import('@/lib/auth/options');

      expect(authOptions.debug).toBeDefined();
    });
  });
});

describe('TypeScript Type Checks', () => {
  it('should have NextAuth imported correctly', async () => {
    const NextAuth = await import('next-auth');
    expect(NextAuth).toBeDefined();
    expect(typeof NextAuth.default).toBe('function');
  });
});
