import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.hoisted(() => vi.fn());
const updateMock = vi.hoisted(() => vi.fn());
const setMock = vi.hoisted(() => vi.fn());
const whereMock = vi.hoisted(() => vi.fn());
const returningMock = vi.hoisted(() => vi.fn());
const eqMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth', () => ({
  auth: authMock,
}));

vi.mock('@/lib/db', () => ({
  db: {
    update: updateMock,
  },
}));

vi.mock('@/lib/db/schema', () => ({
  user: {
    id: 'user.id',
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: eqMock,
}));

describe('POST /api/user/agree-terms', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    updateMock.mockReturnValue({ set: setMock });
    setMock.mockReturnValue({ where: whereMock });
    whereMock.mockReturnValue({ returning: returningMock });
    eqMock.mockReturnValue('eq-clause');
  });

  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(null);
    const { POST } = await import('@/app/api/user/agree-terms/route');
    const req = new Request('http://localhost:3000/api/user/agree-terms', { method: 'POST' });

    const res = await POST(req as any);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.success).toBe(false);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('accepts empty body and uses default terms version', async () => {
    authMock.mockResolvedValue({ user: { id: 'u1' } });
    returningMock.mockResolvedValue([
      { agreedToTermsAt: new Date('2026-02-16T00:00:00.000Z'), termsVersion: '1.0' },
    ]);

    const { POST } = await import('@/app/api/user/agree-terms/route');
    const req = new Request('http://localhost:3000/api/user/agree-terms', { method: 'POST' });

    const res = await POST(req as any);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.version).toBe('1.0');
    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({
        termsVersion: '1.0',
        agreedToTermsAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    );
  });

  it('uses provided terms version when body contains version', async () => {
    authMock.mockResolvedValue({ user: { id: 'u1' } });
    returningMock.mockResolvedValue([
      { agreedToTermsAt: new Date('2026-02-16T00:00:00.000Z'), termsVersion: '2.0' },
    ]);

    const { POST } = await import('@/app/api/user/agree-terms/route');
    const req = new Request('http://localhost:3000/api/user/agree-terms', {
      method: 'POST',
      body: JSON.stringify({ version: '2.0' }),
    });

    const res = await POST(req as any);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.version).toBe('2.0');
    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({
        termsVersion: '2.0',
      }),
    );
  });
});
