import { describe, it, expect } from 'vitest';
import postgres from 'postgres';

describe('Database Connection', () => {
  const databaseUrl = process.env.DATABASE_URL;

  it('should have DATABASE_URL environment variable set', () => {
    expect(databaseUrl).toBeDefined();
    expect(typeof databaseUrl).toBe('string');
    expect(databaseUrl).toContain('postgresql://');
  });

  it('should connect to database successfully', async () => {
    const client = postgres(databaseUrl!, {
      connect_timeout: 5,
    });

    // 测试连接
    const result = await client`SELECT 1 as test`;
    expect(result[0]?.test).toBe(1);

    // 关闭连接
    await client.end();
  });
});
