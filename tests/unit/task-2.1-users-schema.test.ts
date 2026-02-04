import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Task 2.1: 定义 users 表结构
 *
 * 测试目标：
 * - schema.ts 文件存在且包含 users 表定义
 * - users 表包含所有必需字段
 * - 字段类型和约束正确
 * - 索引已定义
 */

describe('Task 2.1 - users 表结构定义', () => {
  const schemaPath = join(process.cwd(), 'src', 'lib', 'db', 'schema.ts');

  describe('schema.ts 文件存在性', () => {
    it('schema.ts 文件应该存在', () => {
      // GIVEN: 项目需要数据库 schema
      // WHEN: 检查 schema.ts
      // THEN: 文件应该存在
      expect(existsSync(schemaPath)).toBe(true);
    });
  });

  describe('users 表定义', () => {
    it('schema.ts 应该导出 users 表', () => {
      // GIVEN: schema.ts 存在
      const schemaContent = readFileSync(schemaPath, 'utf-8');

      // WHEN: 检查 exports
      // THEN: 应该导出 users
      expect(schemaContent).toContain('export const users');
    });

    it('users 表应该使用 pgTable', () => {
      // GIVEN: schema.ts 存在
      const schemaContent = readFileSync(schemaPath, 'utf-8');

      // WHEN: 检查表定义
      // THEN: 应该使用 pgTable
      // 注意：NextAuth Drizzle Adapter 要求单数形式表名（user），但导出别名 users 保持兼容性
      expect(schemaContent).toMatch(/export const user.*pgTable\(['"]user['"]/s);
      expect(schemaContent).toContain('export const users = user;');
    });

    it('users 表名应该是 "user"（NextAuth 约定）', () => {
      // GIVEN: schema.ts 存在
      const schemaContent = readFileSync(schemaPath, 'utf-8');

      // WHEN: 检查表名
      // THEN: 表名应该是 "user"（NextAuth Drizzle Adapter 要求单数形式）
      expect(schemaContent).toMatch(/pgTable\(['"]user['"]/);
    });
  });

  describe('users 表字段定义', () => {
    it('应该包含 id 字段（text, primary key）', () => {
      // GIVEN: schema.ts 存在
      const schemaContent = readFileSync(schemaPath, 'utf-8');

      // WHEN: 检查 id 字段
      // THEN: 应该定义为 text 主键
      expect(schemaContent).toMatch(/id:\s*text\(['"]id['"]\)\.primaryKey\(\)/);
    });

    it('应该包含 email 字段（text, unique, not null）', () => {
      // GIVEN: schema.ts 存在
      const schemaContent = readFileSync(schemaPath, 'utf-8');

      // WHEN: 检查 email 字段
      // THEN: 应该定义为 text，not null
      // 注意: unique 约束可能通过 .unique() 或 uniqueIndex 实现
      expect(schemaContent).toMatch(/email:\s*text\(['"]email['"]\)\.notNull\(\)/);
      // 检查 unique 约束存在（两种方式之一）
      const hasUniqueConstraint =
        schemaContent.match(/email:\s*text\(['"]email['"]\)\.notNull\(\)\.unique\(\)/) ||
        schemaContent.match(/uniqueIndex.*on\(table\.email\)/);
      expect(hasUniqueConstraint).toBeTruthy();
    });

    it('应该包含 name 字段（text, not null）', () => {
      // GIVEN: schema.ts 存在
      const schemaContent = readFileSync(schemaPath, 'utf-8');

      // WHEN: 检查 name 字段
      // THEN: 应该定义为 text，not null
      expect(schemaContent).toMatch(/name:\s*text\(['"]name['"]\)\.notNull\(\)/);
    });

    it('应该包含 image 字段（text, optional）', () => {
      // GIVEN: schema.ts 存在
      const schemaContent = readFileSync(schemaPath, 'utf-8');

      // WHEN: 检查 image 字段
      // THEN: 应该定义为 text（可选）
      expect(schemaContent).toMatch(/image:\s*text\(['"]image['"]\)/);
    });

    it('应该包含 creditBalance 字段（integer, not null, default 0）', () => {
      // GIVEN: schema.ts 存在
      const schemaContent = readFileSync(schemaPath, 'utf-8');

      // WHEN: 检查 creditBalance 字段
      // THEN: 应该定义为 integer，not null，default 0
      expect(schemaContent).toMatch(
        /creditBalance:\s*integer\(['"]credit_balance['"]\)\.notNull\(\)\.default\(0\)/
      );
    });

    it('应该包含 subscriptionTier 字段（text, not null, default "free"）', () => {
      // GIVEN: schema.ts 存在
      const schemaContent = readFileSync(schemaPath, 'utf-8');

      // WHEN: 检查 subscriptionTier 字段
      // THEN: 应该定义为 text，not null，default 'free'
      expect(schemaContent).toMatch(
        /subscriptionTier:\s*text\(['"]subscription_tier['"]\)\.notNull\(\)\.default\(['"]free['"]\)/
      );
    });

    it('应该包含 createdAt 字段（timestamp, not null, default now）', () => {
      // GIVEN: schema.ts 存在
      const schemaContent = readFileSync(schemaPath, 'utf-8');

      // WHEN: 检查 createdAt 字段
      // THEN: 应该定义为 timestamp，not null，defaultNow
      expect(schemaContent).toMatch(
        /createdAt:\s*timestamp\(['"]created_at['"]\)\.notNull\(\)\.defaultNow\(\)/
      );
    });

    it('应该包含 updatedAt 字段（timestamp, not null, default now）', () => {
      // GIVEN: schema.ts 存在
      const schemaContent = readFileSync(schemaPath, 'utf-8');

      // WHEN: 检查 updatedAt 字段
      // THEN: 应该定义为 timestamp，not null，defaultNow
      expect(schemaContent).toMatch(
        /updatedAt:\s*timestamp\(['"]updated_at['"]\)\.notNull\(\)\.defaultNow\(\)/
      );
    });
  });

  describe('导入语句', () => {
    it('应该从 drizzle-orm/pg-core 导入必需函数', () => {
      // GIVEN: schema.ts 存在
      const schemaContent = readFileSync(schemaPath, 'utf-8');

      // WHEN: 检查导入
      // THEN: 应该导入 pgTable, text, integer, timestamp
      expect(schemaContent).toContain("from 'drizzle-orm/pg-core'");
      expect(schemaContent).toMatch(/import.*pgTable.*text.*integer.*timestamp/s);
    });
  });
});
