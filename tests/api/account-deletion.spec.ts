import { test, expect } from '@playwright/test';

/**
 * Story 1-5: Account Deletion - API Tests
 */

test.describe('Story 1-5: Account Deletion API (ATDD)', () => {
  const authHeaders = {
    'x-test-user-id': 'test-user-1',
    'x-test-mode': '1',
  };

  test('[P0][AC-3] should delete account and all related data via DELETE /api/user', async ({ request }) => {
    const response = await request.delete('/api/user', {
      headers: authHeaders,
      data: { confirmation: 'DELETE_MY_ACCOUNT', reAuthToken: 'valid-re-auth-token' },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({
      success: true,
      data: { message: '账户已删除' },
    });
  });

  test('[P0][AC-6] should require re-auth token before deletion', async ({ request }) => {
    const response = await request.delete('/api/user', {
      headers: authHeaders,
      data: { confirmation: 'DELETE_MY_ACCOUNT' },
    });

    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.error.code).toBe('REAUTH_REQUIRED');
  });

  test('[P1][AC-8] should rollback transaction when partial delete fails', async ({ request }) => {
    const response = await request.delete('/api/user', {
      headers: authHeaders,
      data: {
        confirmation: 'DELETE_MY_ACCOUNT',
        reAuthToken: 'valid-re-auth-token',
        testScenario: 'force_partial_failure',
      },
    });

    expect(response.status()).toBe(500);
    const body = await response.json();
    expect(body.error.code).toBe('DELETE_FAILED');
    expect(body.error.message).toContain('删除账户失败');
  });

  test('[P1][AC-4] should clear session after successful deletion', async ({ request }) => {
    const response = await request.delete('/api/user', {
      headers: authHeaders,
      data: { confirmation: 'DELETE_MY_ACCOUNT', reAuthToken: 'valid-re-auth-token' },
    });

    expect(response.status()).toBe(200);

    const sessionResponse = await request.get('/api/auth/session');
    expect(sessionResponse.status()).toBe(200);
    const session = await sessionResponse.json();
    expect(session).toBeNull();
  });

  test('[P0][AC-3] should return 401 for unauthenticated deletion request', async ({ request }) => {
    const response = await request.delete('/api/user', {
      data: { confirmation: 'DELETE_MY_ACCOUNT' },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  test('[P2][AC-7] should complete deletion within 5 seconds', async ({ request }) => {
    const start = Date.now();

    const response = await request.delete('/api/user', {
      headers: authHeaders,
      data: { confirmation: 'DELETE_MY_ACCOUNT', reAuthToken: 'valid-re-auth-token' },
    });

    const duration = Date.now() - start;
    expect(response.status()).toBe(200);
    expect(duration).toBeLessThan(5000);
  });
});
