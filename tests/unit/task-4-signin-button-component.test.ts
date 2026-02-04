import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Task 4: 登录按钮组件验证
 *
 * 测试目标：
 * - SignInButton 组件文件存在
 * - 组件导出正确
 * - 组件使用 signIn 函数
 * - 组件包含 data-testid 选择器
 */

describe('Task 4 - SignInButton 组件验证', () => {
  const componentPath = join(process.cwd(), 'src', 'features', 'auth', 'components', 'SignInButton', 'index.tsx');

  describe('组件文件存在性', () => {
    it('SignInButton/index.tsx 应该存在', () => {
      expect(existsSync(componentPath)).toBe(true);
    });
  });

  describe('组件内容验证', () => {
    it('应该导出 SignInButton 组件', () => {
      const content = readFileSync(componentPath, 'utf-8');
      expect(content).toContain('export');
      expect(content.toLowerCase()).toContain('signinbutton');
    });

    it('应该从 next-auth/react 导入 signIn', () => {
      const content = readFileSync(componentPath, 'utf-8');
      expect(content).toContain('signIn');
      expect(content).toMatch(/from\s+['"]next-auth\/react['"]/);
    });

    it('应该使用 data-testid="google-login-button"', () => {
      const content = readFileSync(componentPath, 'utf-8');
      expect(content).toContain('data-testid="google-login-button"');
    });

    it('应该包含 "使用 Google 登录" 文本', () => {
      const content = readFileSync(componentPath, 'utf-8');
      expect(content).toContain('使用 Google 登录');
    });

    it('应该是按钮或链接元素', () => {
      const content = readFileSync(componentPath, 'utf-8');
      expect(content).toMatch(/<(button|a)/);
    });
  });
});
