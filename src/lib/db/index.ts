import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 验证必要环境变量
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const connectionConfig = {
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
};

// 连接实例（单例模式）
let _client: postgres.Sql | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

export function getDb(): ReturnType<typeof drizzle> {
  if (!_client) {
    try {
      _client = postgres(process.env.DATABASE_URL!, connectionConfig);
      _db = drizzle(_client, { schema });
    } catch (error) {
      console.error('Failed to create database connection:', error);
      throw new Error('Database connection initialization failed');
    }
  }
  return _db!;
}

// 导出数据库实例（兼容现有代码）
export const db = getDb();

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
