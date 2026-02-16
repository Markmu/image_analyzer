import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

/**
 * useRequireAuth Hook
 *
 * Story 1-3: 会话管理与登出
 * 检查用户是否已登录，未登录时重定向到登录页 (AC-3)
 */
export function useRequireAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return; // 还在加载中

    if (!session) {
      // 未登录，重定向到登录页 (Story 1-3, AC-3)
      const callbackUrl = pathname || '/';
      router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
  }, [session, status, router, pathname]);

  return {
    session,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
}
