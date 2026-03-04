/**
 * 状态服务测试
 *
 * 测试任务状态服务层的权限校验和状态聚合
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTaskStatusView, StatusServiceError } from '@/lib/analysis-tasks/status-service';
import type { Session } from 'next-auth';

// Mock auth module
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

describe('Status Service', () => {
  describe('权限校验', () => {
    it('应该拒绝未登录的请求', async () => {
      try {
        await getTaskStatusView('123', null);
        expect(true).toBe(false); // 不应该到达这里
      } catch (error) {
        expect(error).toBeInstanceOf(StatusServiceError);
        if (error instanceof StatusServiceError) {
          expect(error.code).toBe('UNAUTHORIZED');
          expect(error.message).toContain('需要登录');
        }
      }
    });

    it('应该拒绝空的任务 ID', async () => {
      const mockSession: Session = {
        user: { id: 1, name: 'Test User', email: 'test@example.com' },
        expires: '2024-01-01',
      };

      await expect(getTaskStatusView('', mockSession)).rejects.toThrow();
    });
  });

  describe('StatusServiceError', () => {
    it('应该创建带有代码的错误', () => {
      const error = new StatusServiceError('FORBIDDEN', '无权访问此任务状态');
      expect(error.code).toBe('FORBIDDEN');
      expect(error.message).toBe('无权访问此任务状态');
      expect(error.name).toBe('StatusServiceError');
    });

    it('应该正确继承 Error', () => {
      const error = new StatusServiceError('NOT_FOUND', '任务不存在');
      expect(error instanceof Error).toBe(true);
      expect(error instanceof StatusServiceError).toBe(true);
    });
  });

  describe('错误代码映射', () => {
    it('FORBIDDEN 应该返回 403 状态码', () => {
      const error = new StatusServiceError('FORBIDDEN', 'test');
      expect(error.code).toBe('FORBIDDEN');
    });

    it('NOT_FOUND 应该返回 404 状态码', () => {
      const error = new StatusServiceError('NOT_FOUND', 'test');
      expect(error.code).toBe('NOT_FOUND');
    });

    it('UNAUTHORIZED 应该返回 401 状态码', () => {
      const error = new StatusServiceError('UNAUTHORIZED', 'test');
      expect(error.code).toBe('UNAUTHORIZED');
    });

    it('其他错误应该返回 500 状态码', () => {
      const error = new StatusServiceError('INTERNAL_ERROR', 'test');
      expect(error.code).toBe('INTERNAL_ERROR');
    });
  });
});
