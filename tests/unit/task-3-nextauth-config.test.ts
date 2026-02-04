import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Task 3: NextAuth 配置验证
 *
 * 测试目标：
 * - auth 配置文件存在
 * - API 路由文件存在
 * - 配置包含必需的 providers
 * - Session 策略配置正确
 */

describe('Task 3 - NextAuth 配置验证', () => {
  const authIndexPath = join(process.cwd(), 'src', 'lib', 'auth', 'index.ts');
  const authOptionsPath = join(process.cwd(), 'src', 'lib', 'auth', 'options.ts');
  const apiRoutePath = join(process.cwd(), 'src', 'app', 'api', 'auth', '[...nextauth]', 'route.ts');

  describe('配置文件存在性', () => {
    it('src/lib/auth/index.ts 应该存在', () => {
      expect(existsSync(authIndexPath)).toBe(true);
    });

    it('src/lib/auth/options.ts 应该存在', () => {
      expect(existsSync(authOptionsPath)).toBe(true);
    });

    it('API 路由文件应该存在', () => {
      expect(existsSync(apiRoutePath)).toBe(true);
    });
  });

  describe('NextAuth 配置内容', () => {
    it('options.ts 应该导出 authOptions', () => {
      const content = readFileSync(authOptionsPath, 'utf-8');
      expect(content).toContain('export const authOptions');
    });

    it('应该配置 Google Provider', () => {
      const content = readFileSync(authOptionsPath, 'utf-8');
      expect(content).toContain('Google');
      expect(content).toContain('GOOGLE_CLIENT_ID');
      expect(content).toContain('GOOGLE_CLIENT_SECRET');
    });

    it('应该配置 session 策略为 JWT', () => {
      const content = readFileSync(authOptionsPath, 'utf-8');
      expect(content).toContain('strategy: \'jwt\'');
    });

    it('应该配置 maxAge 为 7 天', () => {
      const content = readFileSync(authOptionsPath, 'utf-8');
      expect(content).toContain('7 * 24 * 60 * 60');
    });

    it('应该配置 signIn callback', () => {
      const content = readFileSync(authOptionsPath, 'utf-8');
      expect(content).toContain('async signIn');
    });

    it('应该配置 jwt callback', () => {
      const content = readFileSync(authOptionsPath, 'utf-8');
      expect(content).toContain('async jwt');
    });

    it('应该配置 session callback', () => {
      const content = readFileSync(authOptionsPath, 'utf-8');
      expect(content).toContain('async session');
    });
  });

  describe('API 路由配置', () => {
    it('route.ts 应该导出 handlers', () => {
      const content = readFileSync(apiRoutePath, 'utf-8');
      expect(content).toContain('handlers');
    });

    it('route.ts 应该导出 GET 和 POST', () => {
      const content = readFileSync(apiRoutePath, 'utf-8');
      expect(content).toContain('GET');
      expect(content).toContain('POST');
    });

    it('route.ts 应该从 @/lib/auth 导入', () => {
      const content = readFileSync(apiRoutePath, 'utf-8');
      expect(content).toContain('@/lib/auth');
    });
  });

  describe('类型定义文件', () => {
    const typeDefPath = join(process.cwd(), 'src', 'types', 'next-auth.d.ts');

    it('next-auth.d.ts 应该存在', () => {
      expect(existsSync(typeDefPath)).toBe(true);
    });

    it('应该扩展 Session 接口', () => {
      const content = readFileSync(typeDefPath, 'utf-8');
      expect(content).toContain('declare module \'next-auth\'');
      expect(content).toContain('interface Session');
      expect(content).toContain('id: string');
    });

    it('应该扩展 JWT 接口', () => {
      const content = readFileSync(typeDefPath, 'utf-8');
      expect(content).toContain('declare module \'next-auth/jwt\'');
      expect(content).toContain('interface JWT');
    });
  });
});
