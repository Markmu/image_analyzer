/**
 * 认证 Fixtures 工厂
 *
 * 提供统一的认证 mock 和 session 创建
 * 简化测试中的认证设置
 *
 * @test-architecture Integration Test Fixtures
 * @pattern Mock Object Pattern
 */

import { vi } from 'vitest';
import { auth } from '@/lib/auth';
import type { Session } from 'next-auth';

/**
 * 创建测试用户 Session
 *
 * @param options - Session 配置选项
 * @returns Mock Session 对象
 *
 * @example
 * const session = createMockSession({
 *   userId: 'test-user-123',
 *   name: 'Test User',
 *   email: 'test@example.com'
 * });
 */
export function createMockSession(options: {
  userId?: string;
  name?: string;
  email?: string;
  expires?: string;
}): Session {
  const userId = options.userId || `test-user-${Date.now()}`;

  return {
    user: {
      id: userId,
      name: options.name || 'Test User',
      email: options.email || `test-${userId}@example.com`,
      image: null,
    },
    expires: options.expires || new Date(Date.now() + 3600 * 1000).toISOString(),
  };
}

/**
 * 设置认证 Mock
 *
 * 在测试中使用，简化 auth mock 的设置
 *
 * @param session - 要 mock 的 Session，null 表示未登录
 *
 * @example
 * beforeEach(async () => {
 *   mockAuthService(session);
 * });
 *
 * it('应该返回 401 当用户未登录', async () => {
 *   mockAuthService(null); // 未登录
 *   // ... 测试代码
 * });
 */
export function mockAuthService(session: Session | null): void {
  vi.mocked(auth).mockResolvedValue(session);
}

/**
 * 重置认证 Mock
 *
 * 在 afterEach 中调用，清理 mock 状态
 *
 * @example
 * afterEach(async () => {
 *   resetAuthMock();
 *   await builder.cleanup();
 * });
 */
export function resetAuthMock(): void {
  vi.clearAllMocks();
}

/**
 * 创建认证上下文
 *
 * 提供完整的测试生命周期管理
 *
 * @example
 * const authContext = createAuthContext();
 * const session = authContext.createSession();
 * authContext.mock(session);
 * // ... 测试代码 ...
 * authContext.reset();
 */
export class AuthContext {
  private session: Session | null = null;

  /**
   * 创建一个新的测试 session
   */
  createSession(options?: {
    userId?: string;
    name?: string;
    email?: string;
  }): Session {
    this.session = createMockSession(options || {});
    return this.session;
  }

  /**
   * Mock auth 服务
   */
  mock(): void {
    if (this.session) {
      mockAuthService(this.session);
    }
  }

  /**
   * Mock 未登录状态
   */
  mockUnauthenticated(): void {
    mockAuthService(null);
  }

  /**
   * 重置 mock
   */
  reset(): void {
    resetAuthMock();
    this.session = null;
  }

  /**
   * 获取当前 session 的用户 ID
   */
  getUserId(): string | null {
    return this.session?.user?.id || null;
  }
}

/**
 * 创建认证上下文实例
 *
 * @example
 * const auth = createAuthContext();
 * const session = auth.createSession({ userId: 'test-123' });
 * auth.mock();
 */
export function createAuthContext(): AuthContext {
  return new AuthContext();
}
