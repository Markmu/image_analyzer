import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

/**
 * ATDD API Tests for Story 1-1: OAuth 基础设置
 *
 * 🔴 TDD RED PHASE - All tests are intentionally failing
 *
 * These tests validate EXPECTED behavior for:
 * - NextAuth.js configuration (AC-1)
 * - Database schema and user data storage (AC-2, AC-4)
 * - OAuth callback handling (AC-3)
 *
 * Tests use test.skip() because feature is not yet implemented.
 * Once implementation is complete, remove test.skip() to verify GREEN phase.
 *
 * @story 1-1-oauth-setup
 * @epic 1-user-authentication
 */

test.describe('[Story 1-1] OAuth Setup API Tests (ATDD)', () => {
  describe('[AC-1] NextAuth.js Configuration', () => {
    test.skip('[P1] should return Google provider configuration', async ({ request }) => {
      // GIVEN: NextAuth is configured with Google OAuth
      // WHEN: GET /api/auth/providers
      const response = await request.get('/api/auth/providers');

      // THEN: Should return Google provider config
      expect(response.status()).toBe(200);

      const providers = await response.json();
      expect(providers).toHaveProperty('google');
      expect(providers.google).toMatchObject({
        id: 'google',
        name: 'Google',
        type: 'oauth',
        signinUrl: expect.stringContaining('signin/google'),
        callbackUrl: expect.stringContaining('callback/google'),
      });
    });

    test.skip('[P1] should include required NextAuth environment variables', async ({ request }) => {
      // GIVEN: NextAuth requires environment variables
      // WHEN: GET /api/auth/config (health check endpoint)
      const response = await request.get('/api/auth/config');

      // THEN: Should verify all required env vars are set
      expect(response.status()).toBe(200);

      const config = await response.json();
      expect(config).toMatchObject({
        NEXTAUTH_URL: expect.any(String),
        NEXTAUTH_SECRET: expect.any(String),
        GOOGLE_CLIENT_ID: expect.any(String),
        GOOGLE_CLIENT_SECRET: expect.any(String),
        DATABASE_URL: expect.any(String),
      });
    });
  });

  describe('[AC-2, AC-4] Database Schema and User Data Storage', () => {
    const generateOAuthUser = () => ({
      id: faker.string.uuid(),
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      image: faker.image.avatar(),
    });

    test.skip('[P0] should create new user record on first OAuth login', async ({ request }) => {
      // GIVEN: User completes Google OAuth flow for first time
      const newUser = generateOAuthUser();

      // WHEN: POST /api/auth/callback/google (OAuth callback)
      const response = await request.post('/api/auth/callback/google', {
        data: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          image: newUser.image,
          email_verified: true,
        },
      });

      // THEN: Should create user record with default values
      expect(response.status()).toBe(200);

      const user = await response.json();
      expect(user).toMatchObject({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        image: newUser.image,
        creditBalance: 30, // Initial 30 credits (from story context)
        subscriptionTier: 'free',
      });

      // Verify timestamps
      expect(user.createdAt).toBeTruthy();
      expect(user.updatedAt).toBeTruthy();
    });

    test.skip('[P0] should update existing user on subsequent OAuth login', async ({ request }) => {
      // GIVEN: User already exists in database
      const existingUser = generateOAuthUser();

      // Create user first
      await request.post('/api/auth/callback/google', {
        data: existingUser,
      });

      // Simulate time passing (updated_at should change)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // WHEN: Same user logs in again via OAuth
      const response = await request.post('/api/auth/callback/google', {
        data: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          image: existingUser.image,
          email_verified: true,
        },
      });

      // THEN: Should update updated_at timestamp but preserve other fields
      expect(response.status()).toBe(200);

      const user = await response.json();
      expect(user.id).toBe(existingUser.id);
      expect(user.email).toBe(existingUser.email);
      expect(user.updatedAt).not.toBe(existingUser.updatedAt);
    });

    test.skip('[P2] should enforce email uniqueness constraint', async ({ request }) => {
      // GIVEN: User with email exists
      const existingUser = generateOAuthUser();

      await request.post('/api/auth/callback/google', {
        data: existingUser,
      });

      // WHEN: Attempting to create another user with same email but different ID
      const response = await request.post('/api/auth/callback/google', {
        data: {
          id: faker.string.uuid(), // Different ID
          email: existingUser.email, // Same email - should fail
          name: faker.person.fullName(),
          image: faker.image.avatar(),
          email_verified: true,
        },
      });

      // THEN: Should return error (email is unique constraint)
      expect(response.status()).toBe(400);

      const error = await response.json();
      expect(error).toMatchObject({
        code: 'EMAIL_ALREADY_EXISTS',
        message: expect.stringContaining('email'),
      });
    });

    test.skip('[P1] should retrieve user data from database', async ({ request }) => {
      // GIVEN: User exists in database
      const existingUser = generateOAuthUser();

      await request.post('/api/auth/callback/google', {
        data: existingUser,
      });

      // WHEN: GET /api/users/{id}
      const response = await request.get(`/api/users/${existingUser.id}`);

      // THEN: Should return complete user record
      expect(response.status()).toBe(200);

      const user = await response.json();
      expect(user).toMatchObject({
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        image: existingUser.image,
        creditBalance: expect.any(Number),
        subscriptionTier: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });

  describe('[AC-3] OAuth Login Flow', () => {
    test.skip('[P0] should handle successful OAuth callback', async ({ request }) => {
      // GIVEN: User authorizes with Google OAuth
      const oauthUser = generateOAuthUser();

      // WHEN: Google redirects to callback URL with authorization code
      const response = await request.post('/api/auth/callback/google', {
        data: {
          id: oauthUser.id,
          email: oauthUser.email,
          name: oauthUser.name,
          image: oauthUser.image,
          email_verified: true,
        },
      });

      // THEN: Should create session and return user data
      expect(response.status()).toBe(200);

      const result = await response.json();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('session');
      expect(result.user.email).toBe(oauthUser.email);
    });

    test.skip('[P1] should handle OAuth authorization failure', async ({ request }) => {
      // GIVEN: Google OAuth returns error (user denied authorization)
      // WHEN: Callback with error parameter
      const response = await request.post('/api/auth/callback/google', {
        data: {
          error: 'access_denied',
          error_description: 'The user denied access',
        },
      });

      // THEN: Should return error response
      expect(response.status()).toBe(400);

      const error = await response.json();
      expect(error).toMatchObject({
        code: 'OAUTH_AUTHORIZATION_FAILED',
        message: expect.stringContaining('access_denied'),
      });
    });

    test.skip('[P1] should handle invalid OAuth state', async ({ request }) => {
      // GIVEN: OAuth callback has invalid state parameter (CSRF protection)
      // WHEN: Callback with invalid state
      const response = await request.post('/api/auth/callback/google', {
        data: {
          state: 'invalid_state_value',
          code: 'fake_authorization_code',
        },
      });

      // THEN: Should return error
      expect(response.status()).toBe(401);

      const error = await response.json();
      expect(error).toMatchObject({
        code: 'INVALID_OAUTH_STATE',
      });
    });
  });

  describe('[AC-5] Security', () => {
    test.skip('[P1] should reject requests without valid session', async ({ request }) => {
      // GIVEN: User is not authenticated
      // WHEN: GET /api/protected-endpoint
      const response = await request.get('/api/auth/session');

      // THEN: Should return 401 Unauthorized
      expect(response.status()).toBe(401);

      const error = await response.json();
      expect(error).toMatchObject({
        code: 'UNAUTHORIZED',
        message: expect.stringContaining('session'),
      });
    });

    test.skip('[P2] should use HTTPS in production environment', async ({ request }) => {
      // GIVEN: Application is in production mode
      // WHEN: Checking configuration
      const response = await request.get('/api/auth/config');

      // THEN: Should enforce HTTPS
      expect(response.status()).toBe(200);

      const config = await response.json();
      expect(config.NEXTAUTH_URL).toMatch(/^https:\/\//);
    });
  });

  describe('[AC-8] Error Handling', () => {
    test.skip('[P1] should return error when database connection fails', async ({ request }) => {
      // GIVEN: Database is unavailable
      // WHEN: Attempting OAuth callback
      const response = await request.post('/api/auth/callback/google', {
        data: generateOAuthUser(),
      });

      // THEN: Should return 503 Service Unavailable
      expect(response.status()).toBe(503);

      const error = await response.json();
      expect(error).toMatchObject({
        code: 'DATABASE_CONNECTION_FAILED',
        message: expect.stringContaining('database'),
      });
    });

    test.skip('[P2] should validate required environment variables on startup', async ({ request }) => {
      // GIVEN: Required environment variables are missing
      // WHEN: Checking configuration health
      const response = await request.get('/api/auth/health');

      // THEN: Should return error with missing variables list
      // (This would normally block startup)
      expect(response.status()).toBe(500);

      const error = await response.json();
      expect(error).toMatchObject({
        code: 'MISSING_ENVIRONMENT_VARIABLES',
        message: expect.stringContaining('NEXTAUTH_SECRET'),
      });
    });
  });

  describe('[AC-6] Data Persistence', () => {
    test.skip('[P1] should persist user data across requests', async ({ request }) => {
      // GIVEN: User created via OAuth
      const newUser = generateOAuthUser();

      await request.post('/api/auth/callback/google', {
        data: newUser,
      });

      // WHEN: Retrieving user data in separate request
      const response = await request.get(`/api/users/${newUser.id}`);

      // THEN: Should return same user data (not in-memory only)
      expect(response.status()).toBe(200);

      const user = await response.json();
      expect(user.id).toBe(newUser.id);
      expect(user.email).toBe(newUser.email);
    });
  });

  describe('[AC-7] Performance', () => {
    test.skip('[P2] should complete OAuth callback within 10 seconds', async ({ request }) => {
      // GIVEN: Valid OAuth user data
      const newUser = generateOAuthUser();

      // WHEN: Processing OAuth callback
      const startTime = Date.now();
      const response = await request.post('/api/auth/callback/google', {
        data: newUser,
      });
      const endTime = Date.now();

      // THEN: Should complete within 10 seconds
      expect(response.status()).toBe(200);
      expect(endTime - startTime).toBeLessThan(10000);
    });

    test.skip('[P2] should complete database write within 500ms', async ({ request }) => {
      // GIVEN: New user data to write
      const newUser = generateOAuthUser();

      // WHEN: Writing to database
      const startTime = Date.now();
      const response = await request.post('/api/auth/callback/google', {
        data: newUser,
      });
      const endTime = Date.now();

      // THEN: Database write should complete within 500ms
      expect(response.status()).toBe(200);
      expect(endTime - startTime).toBeLessThan(500);
    });
  });
});
