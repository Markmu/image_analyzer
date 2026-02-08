import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/lib/db';
import { user as userTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { checkAndRewardNewUser, checkNewUser } from '@/features/auth/services';

/**
 * NextAuth 配置选项
 *
 * Epic 1 - Story 1.1: OAuth 基础设置
 * Epic 1 - Story 1.2: 用户注册与 Credit 奖励
 * Epic 1 - Story 1.3: 会话管理与登出
 * Google OAuth 2.0 集成配置 + 新用户奖励机制 + 会话持久化
 */
export const authOptions: NextAuthConfig = {
  adapter: DrizzleAdapter(db) as NextAuthConfig['adapter'],
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
    maxAge: 7 * 24 * 60 * 60, // 7 天 (Story 1-3, AC-1)
    updateAge: 24 * 60 * 60, // 每天更新 (Story 1-3, AC-4)
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true, // 防止 XSS (Story 1-3, AC-6)
        sameSite: 'lax', // 防止 CSRF (Story 1-3, AC-6)
        path: '/',
        secure: process.env.NODE_ENV === 'production', // HTTPS only (Story 1-3, AC-6)
      },
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        // 验证必要字段存在
        if (!user?.email) {
          console.error('[Auth] Missing required user email');
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

        // Epic 1-2: 检测并奖励新用户
        // 注意：某些 OAuth 场景下 signIn 回调阶段可能暂时拿不到 user.id，
        // 不能因此阻断登录流程。
        if (user.id) {
          try {
            const rewardResult = await checkAndRewardNewUser(user.id);
            if (rewardResult.showWelcome) {
              console.log('[Auth] New user rewarded:', {
                userId: user.id,
                creditedAmount: rewardResult.creditedAmount,
                welcomeMessage: rewardResult.welcomeMessage,
              });
            }
          } catch (rewardError) {
            // Credit reward failure should not block login
            console.error('[Auth] Credit reward error (non-blocking):', rewardError);
          }
        } else {
          console.warn('[Auth] user.id missing in signIn callback; skip reward check');
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

          // Epic 1-2: Check if new user for welcome message
          try {
            if (user.id) {
              const { isNewUser } = await checkNewUser(user.id);
              token.isNewUser = isNewUser;
              token.showWelcome = isNewUser;
            } else {
              token.isNewUser = false;
              token.showWelcome = false;
            }
          } catch (error) {
            console.error('[Auth] Error checking new user status:', error);
            token.isNewUser = false;
            token.showWelcome = false;
          }

          // Epic 1-4: Load credit and subscription info from database
          try {
            const dbUser = await db.query.user.findFirst({
              where: eq(userTable.id, token.sub ?? ''),
              columns: {
                creditBalance: true,
                subscriptionTier: true,
              },
            });

            token.creditBalance = dbUser?.creditBalance ?? 0;
            const tier = dbUser?.subscriptionTier;
            token.subscriptionTier =
              tier === 'lite' || tier === 'standard' || tier === 'free'
                ? tier
                : 'free';
          } catch (error) {
            console.error('[Auth] Error loading user credit/subscription:', error);
            token.creditBalance = 0;
            token.subscriptionTier = 'free';
          }
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

          // Epic 1-4: Include credit and subscription info
          (session.user as any).creditBalance = token.creditBalance ?? 0;
          (session.user as any).subscriptionTier = token.subscriptionTier ?? 'free';
        }
        // 添加过期时间 (Story 1-3, AC-1)
        if (token.exp) {
          session.expires = new Date(token.exp * 1000).toISOString() as typeof session.expires;
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
