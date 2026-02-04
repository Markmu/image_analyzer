import NextAuth from 'next-auth';
import { authOptions } from './options';

/**
 * NextAuth 配置导出
 *
 * Epic 1 - Story 1.1: OAuth 基础设置
 * 导出 NextAuth 处理程序用于 API 路由
 */
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

export { authOptions };
