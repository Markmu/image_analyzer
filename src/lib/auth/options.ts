import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/lib/db';

/**
 * NextAuth 配置选项
 *
 * Epic 1 - Story 1.1: OAuth 基础设置
 * Google OAuth 2.0 集成配置
 */
export const authOptions: NextAuthConfig = {
  adapter: DrizzleAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 天
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        // 验证必要字段存在
        if (!user?.email || !user?.id) {
          console.error('[Auth] Missing required user fields');
          return false;
        }

        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user.email)) {
          console.error('[Auth] Invalid email format:', user.email);
          return false;
        }

        // 验证是 Google OAuth
        if (account?.provider !== 'google') {
          console.error('[Auth] Unsupported provider:', account?.provider);
          return false;
        }

        // Drizzle Adapter 会自动处理用户创建和账户关联
        return true;
      } catch (error) {
        console.error('[Auth] signIn callback error:', error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      try {
        // 首次登录时添加用户信息到 token（带类型安全检查）
        if (user && account) {
          if (user.id) token.id = user.id;
          if (user.email) token.email = user.email;
          if (user.name) token.name = user.name;
          if (user.image) token.picture = user.image;
        }
        return token;
      } catch (error) {
        console.error('[Auth] jwt callback error:', error);
        return token; // 返回现有 token 而不是抛出错误
      }
    },
    async session({ session, token }) {
      try {
        // 将 token 中的用户信息添加到 session（带验证）
        if (session.user) {
          session.user.id = token.id || '';
          session.user.email = token.email || '';
          session.user.name = token.name || '';
          session.user.image = token.picture || undefined;
        }
        return session;
      } catch (error) {
        console.error('[Auth] session callback error:', error);
        return session; // 返回现有 session 而不是抛出错误
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
