import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';

/**
 * useAuth Hook
 *
 * Story 1-3: 会话管理与登出
 * 提供认证状态和登出功能
 */
export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const signOut = useCallback(async () => {
    setIsSigningOut(true);
    setSignOutError(null);

    try {
      // 调用 NextAuth signOut (Story 1-3, AC-2)
      await nextAuthSignOut({ redirect: false });

      // 重定向到首页 (Story 1-3, AC-2)
      router.push('/');

      // 显示成功提示 - 由调用方处理 (Story 1-3, AC-7)
    } catch (error) {
      // 错误处理 (Story 1-3, AC-7)
      console.error('[useAuth] Sign out error:', error);
      setSignOutError('登出失败，请重试');
    } finally {
      setIsSigningOut(false);
    }
  }, [router]);

  return {
    user: session?.user,
    session,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isSigningOut,
    signOut,
    signOutError,
  };
}
