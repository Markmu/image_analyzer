import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

/**
 * ATDD API Tests for Story 1-2: 用户注册与 Credit 奖励
 *
 * 🔴 TDD RED PHASE - All tests are intentionally failing
 *
 * These tests validate EXPECTED behavior for:
 * - New user detection logic (AC-1)
 * - Credit automatic granting (AC-2)
 * - Welcome snackbar display (AC-3)
 * - Existing users don't get duplicate rewards (AC-4)
 * - Prevent concurrent granting (AC-5)
 * - Data consistency (AC-6)
 * - Performance requirements (AC-7)
 *
 * Tests use test() because feature is not yet implemented.
 * Once implementation is complete, remove test() to verify GREEN phase.
 *
 * @story 1-2-user-registration
 * @epic 1-user-authentication
 */

test.describe('[Story 1-2] User Registration & Credit Reward API Tests (ATDD)', () => {
  // Helper function to generate test user data
  const generateTestUser = (overrides?: {
    id?: string;
    email?: string;
    creditBalance?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }) => ({
    id: overrides?.id || faker.string.uuid(),
    email: overrides?.email || faker.internet.email().toLowerCase(),
    name: faker.person.fullName(),
    image: faker.image.avatar(),
    creditBalance: overrides?.creditBalance ?? 0,
    createdAt: overrides?.createdAt || new Date(),
    updatedAt: overrides?.updatedAt || new Date(),
  });

  describe('[AC-1] New User Detection', () => {
    test('[P0] should detect new user correctly', async ({ request }) => {
      // GIVEN: User just created (createdAt === updatedAt && creditBalance === 0)
      const newUser = generateTestUser({
        creditBalance: 0,
        createdAt: new Date('2026-02-05T00:00:00.000Z'),
        updatedAt: new Date('2026-02-05T00:00:00.000Z'),
      });

      // WHEN: POST /api/auth/check-new-user with user data
      const response = await request.post('/api/auth/check-new-user', {
        data: { userId: newUser.id },
      });

      // THEN: Should return true for new user
      expect(response.status()).toBe(200);

      const result = await response.json();
      expect(result).toMatchObject({
        isNewUser: true,
        userId: newUser.id,
      });
    });

    test('[P0] should detect existing user correctly', async ({ request }) => {
      // GIVEN: User created in past (createdAt !== updatedAt OR creditBalance > 0)
      const existingUser = generateTestUser({
        creditBalance: 30,
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
        updatedAt: new Date('2026-02-05T00:00:00.000Z'),
      });

      // WHEN: POST /api/auth/check-new-user with existing user data
      const response = await request.post('/api/auth/check-new-user', {
        data: { userId: existingUser.id },
      });

      // THEN: Should return false for existing user
      expect(response.status()).toBe(200);

      const result = await response.json();
      expect(result).toMatchObject({
        isNewUser: false,
        userId: existingUser.id,
      });
    });

    test('[P2] should detect new user with zero balance but old timestamps', async ({ request }) => {
      // GIVEN: User with creditBalance = 0 but createdAt !== updatedAt (edge case)
      const edgeCaseUser = generateTestUser({
        creditBalance: 0,
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
        updatedAt: new Date('2026-02-05T00:00:00.000Z'),
      });

      // WHEN: POST /api/auth/check-new-user
      const response = await request.post('/api/auth/check-new-user', {
        data: { userId: edgeCaseUser.id },
      });

      // THEN: Should NOT be considered new user (timestamps differ)
      expect(response.status()).toBe(200);

      const result = await response.json();
      expect(result.isNewUser).toBe(false);
    });
  });

  describe('[AC-2] Credit Automatic Granting', () => {
    test('[P0] should grant 30 credits to new user on first login', async ({ request }) => {
      // GIVEN: New user detected (AC-1 passed)
      const newUser = generateTestUser({
        creditBalance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // WHEN: POST /api/auth/reward-new-user
      const response = await request.post('/api/auth/reward-new-user', {
        data: { userId: newUser.id },
      });

      // THEN: Should grant 30 credits
      expect(response.status()).toBe(200);

      const result = await response.json();
      expect(result).toMatchObject({
        userId: newUser.id,
        previousBalance: 0,
        newBalance: 30,
        creditedAmount: 30,
      });

      // AND: Verify database was updated
      const verifyResponse = await request.get(`/api/users/${newUser.id}`);
      expect(verifyResponse.status()).toBe(200);

      const user = await verifyResponse.json();
      expect(user.creditBalance).toBe(30);
      expect(user.updatedAt).not.toBe(newUser.updatedAt.getTime());
    });

    test('[P1] should not grant credits if user already has balance', async ({ request }) => {
      // GIVEN: Existing user with credits
      const existingUser = generateTestUser({
        creditBalance: 15,
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
        updatedAt: new Date('2026-02-05T00:00:00.000Z'),
      });

      // WHEN: POST /api/auth/reward-new-user
      const response = await request.post('/api/auth/reward-new-user', {
        data: { userId: existingUser.id },
      });

      // THEN: Should return success but indicate no change
      expect(response.status()).toBe(200);

      const result = await response.json();
      expect(result).toMatchObject({
        userId: existingUser.id,
        creditedAmount: 0,
        message: expect.stringContaining('already rewarded'),
      });

      // AND: Balance should remain unchanged
      const verifyResponse = await request.get(`/api/users/${existingUser.id}`);
      const user = await verifyResponse.json();
      expect(user.creditBalance).toBe(15);
    });
  });

  describe('[AC-3] Welcome Snackbar Display', () => {
    test('[P1] should return welcome flag for new users', async ({ request }) => {
      // GIVEN: New user just rewarded with credits
      const newUser = generateTestUser({
        creditBalance: 0,
      });

      // WHEN: POST /api/auth/reward-new-user
      const response = await request.post('/api/auth/reward-new-user', {
        data: { userId: newUser.id },
      });

      // THEN: Response should include showWelcome flag
      expect(response.status()).toBe(200);

      const result = await response.json();
      expect(result).toMatchObject({
        showWelcome: true,
        welcomeMessage: '欢迎！您已获得 30 次 free credit',
      });
    });

    test('[P1] should not return welcome flag for existing users', async ({ request }) => {
      // GIVEN: Existing user logging in
      const existingUser = generateTestUser({
        creditBalance: 30,
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
        updatedAt: new Date('2026-02-05T00:00:00.000Z'),
      });

      // WHEN: POST /api/auth/reward-new-user
      const response = await request.post('/api/auth/reward-new-user', {
        data: { userId: existingUser.id },
      });

      // THEN: showWelcome flag should be false
      expect(response.status()).toBe(200);

      const result = await response.json();
      expect(result.showWelcome).toBe(false);
      expect(result.welcomeMessage).toBeUndefined();
    });
  });

  describe('[AC-4] Existing Users No Duplicate Rewards', () => {
    test('[P0] should not grant credits on subsequent logins', async ({ request }) => {
      // GIVEN: User with creditBalance > 0
      const existingUser = generateTestUser({
        creditBalance: 30,
      });

      // WHEN: Multiple login attempts (simulating concurrent requests)
      const responses = await Promise.all([
        request.post('/api/auth/reward-new-user', { data: { userId: existingUser.id } }),
        request.post('/api/auth/reward-new-user', { data: { userId: existingUser.id } }),
        request.post('/api/auth/reward-new-user', { data: { userId: existingUser.id } }),
      ]);

      // THEN: All requests should succeed but not add credits
      for (const response of responses) {
        expect(response.status()).toBe(200);

        const result = await response.json();
        expect(result.creditedAmount).toBe(0);
        expect(result.newBalance).toBe(30);
      }

      // AND: Final balance should still be 30
      const verifyResponse = await request.get(`/api/users/${existingUser.id}`);
      const user = await verifyResponse.json();
      expect(user.creditBalance).toBe(30);
    });

    test('[P1] should handle zero balance but old timestamps', async ({ request }) => {
      // GIVEN: User with creditBalance = 0 but old createdAt (edge case from AC-1)
      const edgeUser = generateTestUser({
        creditBalance: 0,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-02-05T00:00:00.000Z'),
      });

      // WHEN: Attempting to reward
      const response = await request.post('/api/auth/reward-new-user', {
        data: { userId: edgeUser.id },
      });

      // THEN: Should not reward (timestamps indicate not truly new)
      expect(response.status()).toBe(200);

      const result = await response.json();
      expect(result.creditedAmount).toBe(0);
    });
  });

  describe('[AC-5] Prevent Concurrent Granting', () => {
    test('[P1] should only grant once for concurrent requests', async ({ request }) => {
      // GIVEN: New user (creditBalance = 0, same timestamps)
      const newUser = generateTestUser({
        creditBalance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // WHEN: Sending 10 concurrent requests (simulating race condition)
      const concurrentRequests = Array.from({ length: 10 }, () =>
        request.post('/api/auth/reward-new-user', {
          data: { userId: newUser.id },
        })
      );

      const responses = await Promise.all(concurrentRequests);

      // THEN: Only ONE request should grant credits, rest should indicate no-op
      const results = await Promise.all(
        responses.map(async (r) => await r.json())
      );

      const grantedCount = results.filter((r) => r.creditedAmount === 30).length;
      const noOpCount = results.filter((r) => r.creditedAmount === 0).length;

      expect(grantedCount).toBe(1); // Only one grant
      expect(noOpCount).toBe(9); // All others are no-ops

      // AND: Final balance should be 30 (not 300)
      const verifyResponse = await request.get(`/api/users/${newUser.id}`);
      const user = await verifyResponse.json();
      expect(user.creditBalance).toBe(30);
    });

    test('[P1] should use database transaction for atomicity', async ({ request }) => {
      // GIVEN: New user
      const newUser = generateTestUser({
        creditBalance: 0,
      });

      // WHEN: Concurrent requests while simulating database latency
      const responses = await Promise.all([
        request.post('/api/auth/reward-new-user', {
          data: { userId: newUser.id },
        }),
        request.post('/api/auth/reward-new-user', {
          data: { userId: newUser.id },
        }),
      ]);

      // THEN: Both should succeed (transaction prevents race)
      expect(responses[0].status()).toBeGreaterThanOrEqual(200);
      expect(responses[0].status()).toBeLessThan(300);
      expect(responses[1].status()).toBeGreaterThanOrEqual(200);
      expect(responses[1].status()).toBeLessThan(300);

      // AND: Only one credit grant should occur
      const results = await Promise.all(
        responses.map(async (r) => await r.json())
      );

      const totalGranted = results.reduce((sum, r) => sum + (r.creditedAmount || 0), 0);
      expect(totalGranted).toBe(30); // Not 60
    });
  });

  describe('[AC-6] Data Consistency', () => {
    test('[P1] should persist credit balance immediately after granting', async ({ request }) => {
      // GIVEN: New user
      const newUser = generateTestUser({
        creditBalance: 0,
      });

      // WHEN: Granting credits
      const grantResponse = await request.post('/api/auth/reward-new-user', {
        data: { userId: newUser.id },
      });

      expect(grantResponse.status()).toBe(200);

      // THEN: Immediate query should return updated balance
      const queryResponse = await request.get(`/api/users/${newUser.id}`);
      expect(queryResponse.status()).toBe(200);

      const user = await queryResponse.json();
      expect(user.creditBalance).toBe(30);
      expect(user.updatedAt).toBeTruthy();
    });

    test('[P1] should maintain consistency across multiple queries', async ({ request }) => {
      // GIVEN: New user rewarded
      const newUser = generateTestUser({
        creditBalance: 0,
      });

      await request.post('/api/auth/reward-new-user', {
        data: { userId: newUser.id },
      });

      // WHEN: Querying user data multiple times
      const queries = await Promise.all([
        request.get(`/api/users/${newUser.id}`),
        request.get(`/api/users/${newUser.id}`),
        request.get(`/api/users/${newUser.id}`),
      ]);

      // THEN: All queries should return same consistent balance
      for (const query of queries) {
        expect(query.status()).toBe(200);

        const user = await query.json();
        expect(user.creditBalance).toBe(30);
        expect(user.id).toBe(newUser.id);
      }
    });

    test('[P2] should update timestamp when credit balance changes', async ({ request }) => {
      // GIVEN: New user with specific timestamp
      const originalTimestamp = new Date('2026-02-05T00:00:00.000Z');
      const newUser = generateTestUser({
        creditBalance: 0,
        createdAt: originalTimestamp,
        updatedAt: originalTimestamp,
      });

      // WHEN: Granting credits
      await request.post('/api/auth/reward-new-user', {
        data: { userId: newUser.id },
      });

      // THEN: updatedAt should be later than createdAt
      const queryResponse = await request.get(`/api/users/${newUser.id}`);
      const user = await queryResponse.json();

      expect(new Date(user.updatedAt).getTime()).toBeGreaterThan(
        new Date(user.createdAt).getTime()
      );
    });
  });

  describe('[AC-7] Performance Requirements', () => {
    test('[P2] should complete credit granting within 500ms', async ({ request }) => {
      // GIVEN: New user
      const newUser = generateTestUser({
        creditBalance: 0,
      });

      // WHEN: Granting credits
      const startTime = Date.now();
      const response = await request.post('/api/auth/reward-new-user', {
        data: { userId: newUser.id },
      });
      const endTime = Date.now();
      const duration = endTime - startTime;

      // THEN: Should complete within 500ms
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(500);

      const result = await response.json();
      expect(result.creditedAmount).toBe(30);
    });

    test('[P2] should not significantly delay login flow', async ({ request }) => {
      // GIVEN: New user data
      const newUser = generateTestUser({
        creditBalance: 0,
      });

      // WHEN: Simulating complete login flow (OAuth callback + credit check + reward)
      const startTime = Date.now();

      // OAuth callback (simulated)
      await request.post('/api/auth/callback/google', {
        data: { id: newUser.id, email: newUser.email },
      });

      // Credit check and reward
      await request.post('/api/auth/reward-new-user', {
        data: { userId: newUser.id },
      });

      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      // THEN: Complete flow should be reasonable (< 2 seconds)
      expect(totalDuration).toBeLessThan(2000);
    });
  });

  describe('[AC-8] Error Handling', () => {
    test('[P1] should handle database connection failure gracefully', async ({ request }) => {
      // GIVEN: Database is unavailable (simulated)
      // WHEN: Attempting to reward user
      const response = await request.post('/api/auth/reward-new-user', {
        data: { userId: faker.string.uuid() },
      });

      // THEN: Should return 503 Service Unavailable
      expect(response.status()).toBe(503);

      const error = await response.json();
      expect(error).toMatchObject({
        code: 'DATABASE_CONNECTION_FAILED',
        message: expect.stringContaining('database'),
      });
    });

    test('[P1] should handle user not found error', async ({ request }) => {
      // GIVEN: Non-existent user ID
      const nonExistentUserId = faker.string.uuid();

      // WHEN: Attempting to reward
      const response = await request.post('/api/auth/reward-new-user', {
        data: { userId: nonExistentUserId },
      });

      // THEN: Should return 404
      expect(response.status()).toBe(404);

      const error = await response.json();
      expect(error).toMatchObject({
        code: 'USER_NOT_FOUND',
        message: expect.stringContaining('user'),
      });
    });

    test('[P1] should rollback transaction on update failure', async ({ request }) => {
      // GIVEN: New user (will cause update failure)
      const newUser = generateTestUser({
        creditBalance: 0,
      });

      // WHEN: Update fails mid-transaction
      const response = await request.post('/api/auth/reward-new-user', {
        data: {
          userId: newUser.id,
          simulateFailure: true, // Flag to simulate failure
        },
      });

      // THEN: Should return error
      expect(response.status()).toBe(500);

      // AND: User balance should remain unchanged (rollback)
      const queryResponse = await request.get(`/api/users/${newUser.id}`);
      const user = await queryResponse.json();
      expect(user.creditBalance).toBe(0);
    });
  });

  describe('[Integration] OAuth Callback Integration', () => {
    test('[P0] should integrate credit granting with OAuth signIn callback', async ({ request }) => {
      // GIVEN: New user completing OAuth login for first time
      const newUser = generateTestUser({
        creditBalance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // WHEN: OAuth callback triggers signIn
      const response = await request.post('/api/auth/callback/google', {
        data: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          image: newUser.image,
          email_verified: true,
        },
      });

      // THEN: Should complete OAuth flow AND grant credits
      expect(response.status()).toBe(200);

      const result = await response.json();
      expect(result.user).toBeDefined();
      expect(result.user.creditBalance).toBe(30);
      expect(result.showWelcome).toBe(true);
    });

    test('[P0] should not grant credits on existing user OAuth login', async ({ request }) => {
      // GIVEN: Existing user
      const existingUser = generateTestUser({
        creditBalance: 30,
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
        updatedAt: new Date('2026-02-05T00:00:00.000Z'),
      });

      // WHEN: OAuth callback for existing user
      const response = await request.post('/api/auth/callback/google', {
        data: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          image: existingUser.image,
          email_verified: true,
        },
      });

      // THEN: Should complete OAuth but not grant credits
      expect(response.status()).toBe(200);

      const result = await response.json();
      expect(result.user.creditBalance).toBe(30);
      expect(result.showWelcome).toBe(false);
    });
  });
});
