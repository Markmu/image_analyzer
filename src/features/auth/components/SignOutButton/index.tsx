import { Button } from '@mui/material';
import { CircularProgress } from '@mui/material';
import { useAuth } from '@/features/auth/hooks/useAuth';

/**
 * SignOutButton 组件
 *
 * Story 1-3: 会话管理与登出
 * 提供登出按钮，显示加载状态 (AC-7)
 */
export function SignOutButton() {
  const { signOut, isSigningOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Button
      onClick={handleSignOut}
      disabled={isSigningOut}
      variant="text"
      color="inherit"
      startIcon={isSigningOut ? <CircularProgress size={16} /> : undefined}
      data-testid="sign-out-button"
    >
      {isSigningOut ? '登出中...' : '登出'}
    </Button>
  );
}
