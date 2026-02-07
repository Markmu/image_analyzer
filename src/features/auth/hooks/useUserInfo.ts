import { useSession } from 'next-auth/react';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  image: string | null;
  creditBalance: number;
  subscriptionTier: 'free' | 'lite' | 'standard';
}

export function useUserInfo() {
  const { data: session, status } = useSession();

  // 从 session 中提取用户信息
  const user: UserInfo | null = session?.user ? {
    id: session.user.id,
    email: session.user.email ?? '',
    name: session.user.name ?? '',
    image: session.user.image ?? null,
    creditBalance: session.user.creditBalance ?? 0,
    subscriptionTier: session.user.subscriptionTier ?? 'free',
  } : null;

  return {
    user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
}
