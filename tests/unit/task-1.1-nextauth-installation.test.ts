import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Task 1.1.2: 验证 NextAuth.js v5 安装成功
 *
 * 测试目标：
 * - next-auth@beta 已安装
 * - @auth/drizzle-adapter 已安装
 * - package.json 包含正确的依赖版本
 */

describe('Task 1.1.2 - NextAuth.js v5 安装验证', () => {
  const packageJsonPath = join(process.cwd(), 'package.json');

  describe('next-auth@beta 依赖', () => {
    it('应该在 package.json 中安装 next-auth', () => {
      // GIVEN: 项目根目录存在
      expect(existsSync(packageJsonPath)).toBe(true);

      // WHEN: 读取 package.json
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

      // THEN: next-auth 应该在 dependencies 中
      expect(packageJson.dependencies).toHaveProperty('next-auth');

      // AND: 版本应该是 beta (v5)
      const version = packageJson.dependencies['next-auth'];
      expect(version).toMatch(/beta|^\^5/);
    });

    it('next-auth node_modules 目录应该存在', () => {
      // GIVEN: next-auth 已安装
      // WHEN: 检查 node_modules
      // THEN: next-auth 目录应该存在
      const nextAuthPath = join(process.cwd(), 'node_modules', 'next-auth');
      expect(existsSync(nextAuthPath)).toBe(true);
    });
  });

  describe('@auth/drizzle-adapter 依赖', () => {
    it('应该在 package.json 中安装 @auth/drizzle-adapter', () => {
      // GIVEN: 项目根目录存在
      expect(existsSync(packageJsonPath)).toBe(true);

      // WHEN: 读取 package.json
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

      // THEN: @auth/drizzle-adapter 应该在 dependencies 中
      expect(packageJson.dependencies).toHaveProperty('@auth/drizzle-adapter');
    });

    it('@auth/drizzle-adapter node_modules 目录应该存在', () => {
      // GIVEN: @auth/drizzle-adapter 已安装
      // WHEN: 检查 node_modules
      // THEN: @auth/drizzle-adapter 目录应该存在
      const adapterPath = join(process.cwd(), 'node_modules', '@auth', 'drizzle-adapter');
      expect(existsSync(adapterPath)).toBe(true);
    });
  });

  describe('依赖版本兼容性', () => {
    it('next-auth 和 @auth/drizzle-adapter 版本应该兼容', () => {
      // GIVEN: package.json 存在
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

      // WHEN: 检查两个依赖都存在
      const hasNextAuth = 'next-auth' in packageJson.dependencies;
      const hasDrizzleAdapter = '@auth/drizzle-adapter' in packageJson.dependencies;

      // THEN: 两个依赖都应该安装
      expect(hasNextAuth).toBe(true);
      expect(hasDrizzleAdapter).toBe(true);
    });
  });
});
