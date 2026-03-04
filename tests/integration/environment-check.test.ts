/**
 * 集成测试前置检查
 *
 * 在运行集成测试前验证数据库连接和环境配置
 */

import { beforeEach, describe, it } from 'vitest';
import { getDb } from '@/lib/db';
import { batchAnalysisResults } from '@/lib/db/schema';

describe('集成测试环境检查', () => {
  it('应该能够连接到数据库', async () => {
    const db = getDb();

    try {
      // 尝试执行简单查询
      await db.select({ count: batchAnalysisResults.id }).from(batchAnalysisResults).limit(1);
      console.log('✅ 数据库连接成功');
    } catch (error) {
      console.error('❌ 数据库连接失败');
      console.error('请确保：');
      console.error('  1. 测试数据库已启动');
      console.error('  2. DATABASE_URL 环境变量已配置');
      console.error('  3. 数据库 schema 已推送');
      console.error('');
      console.error('启动测试数据库：');
      console.error('  npm run test:db:start');
      console.error('  或');
      console.error('  ./scripts/test.sh start-db');
      console.error('');
      console.error('查看详细文档：');
      console.error('  docs/test-setup.md');
      console.error('');
      console.error('错误信息：', error);
      throw error;
    }
  });

  it('应该显示当前环境配置', () => {
    const dbUrl = process.env.DATABASE_URL;
    console.log('📝 当前数据库配置：');
    console.log('  DATABASE_URL:', dbUrl ? '***已配置***' : '❌ 未配置');

    if (!dbUrl) {
      console.warn('⚠️  警告: DATABASE_URL 未配置');
      console.warn('建议创建 .env.test.local 文件：');
      console.warn('  cp .env.test.example .env.test.local');
    } else {
      // 隐藏密码部分
      const maskedUrl = dbUrl.replace(/:([^:@]{1,})@/, ':***@');
      console.log('  完整配置:', maskedUrl);
    }
  });
});
