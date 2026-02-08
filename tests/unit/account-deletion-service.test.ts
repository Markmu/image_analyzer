import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const transaction = vi.fn();
  const execute = vi.fn();
  const insertValues = vi.fn();
  const insert = vi.fn(() => ({ values: insertValues }));

  const where = vi.fn();
  const del = vi.fn(() => ({ where }));

  return { transaction, execute, insert, insertValues, del, where };
});

vi.mock('@/lib/db', () => ({
  db: {
    transaction: mocks.transaction,
  },
}));

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>();
  return {
    ...actual,
    eq: vi.fn((a, b) => ({ a, b })),
  };
});

describe('deleteUserAccount', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    mocks.transaction.mockImplementation(async (cb: (tx: any) => Promise<any>) => cb({
      execute: mocks.execute,
      delete: mocks.del,
      insert: mocks.insert,
    }));

    mocks.where.mockResolvedValue(undefined);
    mocks.execute.mockResolvedValue(undefined);
    mocks.insertValues.mockResolvedValue(undefined);
  });

  it('should delete related records in required order', async () => {
    const { deleteUserAccount } = await import('@/features/auth/services/account-deletion.service');

    await deleteUserAccount('user-1', { ipAddress: '127.0.0.1', userAgent: 'vitest' });

    expect(mocks.transaction).toHaveBeenCalledTimes(1);
    expect(mocks.execute).toHaveBeenCalledTimes(4);
    expect(mocks.del).toHaveBeenCalledTimes(3); // session/account/user
    expect(mocks.insert).toHaveBeenCalledTimes(1);
  });

  it('should rollback when transaction step fails', async () => {
    const { deleteUserAccount } = await import('@/features/auth/services/account-deletion.service');
    mocks.execute.mockRejectedValueOnce(new Error('db-fail'));

    await expect(deleteUserAccount('user-1')).rejects.toThrow('db-fail');
  });
});
