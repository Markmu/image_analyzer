import { withAuth } from 'next-auth/middleware';

/**
 * NextAuth 中间件
 *
 * Story 1-3: 会话管理与登出
 * 保护需要认证的路由 (AC-3, AC-6)
 */

export default withAuth({
  pages: {
    signIn: '/api/auth/signin',
  },
});

export const config = {
  // 保护需要认证的路由 (Story 1-3, AC-3)
  matcher: [
    '/dashboard/:path*',
    '/analysis/:path*',
    '/templates/:path*',
  ],
};
