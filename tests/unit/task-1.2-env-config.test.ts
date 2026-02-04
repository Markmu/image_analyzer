import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Task 1.2: 配置环境变量
 *
 * 测试目标：
 * - .env.local 包含所有必需的环境变量
 * - .env.example 包含环境变量模板
 * - NEXTAUTH_SECRET 使用强随机值
 */

describe('Task 1.2 - 环境变量配置', () => {
  const envLocalPath = join(process.cwd(), '.env.local');
  const envExamplePath = join(process.cwd(), '.env.example');

  describe('.env.local 配置', () => {
    it('.env.local 文件应该存在', () => {
      // GIVEN: 项目需要环境变量配置
      // WHEN: 检查 .env.local
      // THEN: 文件应该存在
      expect(existsSync(envLocalPath)).toBe(true);
    });

    it('应该包含 NEXTAUTH_URL', () => {
      // GIVEN: .env.local 存在
      const envContent = readFileSync(envLocalPath, 'utf-8');

      // WHEN: 检查环境变量
      // THEN: 应该包含 NEXTAUTH_URL
      expect(envContent).toContain('NEXTAUTH_URL=');
      expect(envContent).toMatch(/NEXTAUTH_URL=.*localhost/);
    });

    it('应该包含 NEXTAUTH_SECRET', () => {
      // GIVEN: .env.local 存在
      const envContent = readFileSync(envLocalPath, 'utf-8');

      // WHEN: 检查环境变量
      // THEN: 应该包含 NEXTAUTH_SECRET 且长度 >= 32 字符
      expect(envContent).toContain('NEXTAUTH_SECRET=');
      const secretMatch = envContent.match(/NEXTAUTH_SECRET=(.+)/);
      expect(secretMatch).toBeTruthy();
      expect(secretMatch![1].length).toBeGreaterThanOrEqual(32);
    });

    it('应该包含 GOOGLE_CLIENT_ID', () => {
      // GIVEN: .env.local 存在
      const envContent = readFileSync(envLocalPath, 'utf-8');

      // WHEN: 检查环境变量
      // THEN: 应该包含 GOOGLE_CLIENT_ID
      expect(envContent).toContain('GOOGLE_CLIENT_ID=');
    });

    it('应该包含 GOOGLE_CLIENT_SECRET', () => {
      // GIVEN: .env.local 存在
      const envContent = readFileSync(envLocalPath, 'utf-8');

      // WHEN: 检查环境变量
      // THEN: 应该包含 GOOGLE_CLIENT_SECRET
      expect(envContent).toContain('GOOGLE_CLIENT_SECRET=');
    });

    it('应该包含 DATABASE_URL', () => {
      // GIVEN: .env.local 存在
      const envContent = readFileSync(envLocalPath, 'utf-8');

      // WHEN: 检查环境变量
      // THEN: 应该包含 DATABASE_URL
      expect(envContent).toContain('DATABASE_URL=');
      expect(envContent).toMatch(/DATABASE_URL=.*postgresql/);
    });
  });

  describe('.env.example 模板', () => {
    it('.env.example 文件应该存在', () => {
      // GIVEN: 项目需要环境变量模板
      // WHEN: 检查 .env.example
      // THEN: 文件应该存在
      expect(existsSync(envExamplePath)).toBe(true);
    });

    it('应该包含所有必需的环境变量模板', () => {
      // GIVEN: .env.example 存在
      const envContent = readFileSync(envExamplePath, 'utf-8');

      // WHEN: 检查环境变量模板
      // THEN: 应该包含所有必需变量
      const requiredVars = [
        'NEXTAUTH_URL',
        'NEXTAUTH_SECRET',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'DATABASE_URL',
      ];

      requiredVars.forEach((varName) => {
        expect(envContent).toContain(varName);
      });
    });
  });

  describe('NEXTAUTH_SECRET 强度', () => {
    it('NEXTAUTH_SECRET 应该使用强随机值（长度 >= 32）', () => {
      // GIVEN: .env.local 存在
      const envContent = readFileSync(envLocalPath, 'utf-8');

      // WHEN: 提取 NEXTAUTH_SECRET
      const secretMatch = envContent.match(/NEXTAUTH_SECRET=(.+)/);

      // THEN: 密钥长度应该 >= 32 字符（符合安全最佳实践）
      expect(secretMatch).toBeTruthy();
      expect(secretMatch![1].length).toBeGreaterThanOrEqual(32);
    });
  });
});
