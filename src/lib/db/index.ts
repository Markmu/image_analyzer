import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

const connectionConfig = {
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
};

// 连接实例（单例模式）
let _client: postgres.Sql | null = null;
let _db: PostgresJsDatabase<typeof schema> | null = null;

export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!_client) {
    // 验证必要环境变量（延迟到实际调用时）
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    try {
      _client = postgres(process.env.DATABASE_URL, connectionConfig);
      _db = drizzle(_client, { schema });
    } catch (error) {
      console.error('Failed to create database connection:', error);
      throw new Error('Database connection initialization failed');
    }
  }
  return _db!;
}

// 导出 schema
export { schema };

// 优雅关闭连接
export async function closeDbConnection(): Promise<void> {
  if (_client) {
    await _client.end();
    _client = null;
    _db = null;
  }
}
