import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.hoisted(() => vi.fn());
const deleteUserAccountMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth', () => ({
  auth: authMock,
}));

vi.mock('@/features/auth/services/account-deletion.service', () => ({
  deleteUserAccount: deleteUserAccountMock,
}));

describe('DELETE /api/user', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(null);
    const { DELETE } = await import('@/app/api/user/route');
    const req = new Request('http://localhost:3000/api/user', { method: 'DELETE', body: JSON.stringify({ confirmation: 'DELETE_MY_ACCOUNT' }) });

    const res = await DELETE(req as any);
    expect(res.status).toBe(401);
  });

  it('returns 400 when confirmation phrase missing', async () => {
    authMock.mockResolvedValue({ user: { id: 'u1' } });
    const { DELETE } = await import('@/app/api/user/route');
    const req = new Request('http://localhost:3000/api/user', { method: 'DELETE', body: JSON.stringify({ confirmation: 'wrong' }) });

    const res = await DELETE(req as any);
    expect(res.status).toBe(400);
  });

  it('returns 200 when deletion succeeds', async () => {
    authMock.mockResolvedValue({ user: { id: 'u1', email: 'u1@example.com' } });
    deleteUserAccountMock.mockResolvedValue({ success: true });
    const { DELETE } = await import('@/app/api/user/route');
    const req = new Request('http://localhost:3000/api/user', {
      method: 'DELETE',
      headers: { 'user-agent': 'vitest', referer: 'http://localhost:3000' },
      body: JSON.stringify({ confirmation: 'DELETE_MY_ACCOUNT', reAuthToken: 'u1@example.com' }),
    });

    const res = await DELETE(req as any);
    expect(res.status).toBe(200);
  });
});
