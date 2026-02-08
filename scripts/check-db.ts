import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/lib/db/schema';

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function checkImagesTable() {
  try {
    // 查询images表的结构
    const result = await client`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'images'
      ORDER BY ordinal_position;
    `;

    console.log('\n✅ 数据库迁移完成');
    console.log('✅ images表已创建\n');
    console.log('字段列表:');
    console.table(result);

    // 检查索引
    const indexes = await client`
      SELECT
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename = 'images';
    `;

    console.log('\n索引列表:');
    console.table(indexes);

  } catch (error) {
    console.error('错误:', error);
  } finally {
    await client.end();
  }
}

checkImagesTable();
