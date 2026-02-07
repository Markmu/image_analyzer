import { auth } from '@/lib/auth';

/**
 * NextAuth 中间件
 *
 * Story 1-3: 会话管理与登出
 * 保护需要认证的路由 (AC-3, AC-6)
 *
 * NextAuth v5 使用 auth() 函数而不是 withAuth
 */

export default auth((req) => {
  // 认证逻辑由 auth() 自动处理
  // 未认证用户会被重定向到登录页
});

export const config = {
  // 保护需要认证的路由 (Story 1-3, AC-3)
  matcher: [
    '/dashboard/:path*',
    '/analysis/:path*',
    '/templates/:path*',
  ],
};
