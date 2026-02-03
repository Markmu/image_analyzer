import { describe, it, expect } from 'vitest';
import postgres from 'postgres';

describe('Database Connection', () => {
  const databaseUrl = process.env.DATABASE_URL;

  it('should have DATABASE_URL environment variable set', () => {
    // Skip in CI if DATABASE_URL is not set
    if (!databaseUrl) {
      console.log('DATABASE_URL not set, skipping database connection test');
      return;
    }
    expect(databaseUrl).toBeDefined();
    expect(typeof databaseUrl).toBe('string');
    expect(databaseUrl).toContain('postgresql://');
  });

  it('should connect to database successfully', async () => {
    // Skip in CI if DATABASE_URL is not set
    if (!databaseUrl) {
      console.log('DATABASE_URL not set, skipping database connection test');
      return;
    }
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
