import { handlers } from '@/lib/auth';

/**
 * NextAuth API 路由
 *
 * Epic 1 - Story 1.1: OAuth 基础设置
 * 处理所有 NextAuth 相关的 API 请求
 *
 * GET /api/auth/signin - 登录页面
 * POST /api/auth/signin - 登录请求
 * GET /api/auth/callback/google - OAuth 回调
 * POST /api/auth/signout - 登出
 * GET /api/auth/session - 获取当前会话
 */
export const { GET, POST } = handlers;
