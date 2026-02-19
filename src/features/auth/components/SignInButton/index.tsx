'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@mui/material';
import { Chrome } from 'lucide-react';

/**
 * SignInButton 组件 - Google OAuth 登录按钮
 *
 * Epic 1 - Story 1.1: OAuth 基础设置
 * 使用 Glassmorphism 风格的登录按钮
 */
export function SignInButton() {
  const handleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <Button
      onClick={handleSignIn}
      data-testid="google-login-button"
      variant="contained"
      startIcon={<Chrome size={18} />}
      sx={{
        minHeight: 44,
        px: 3,
        borderRadius: 1,
        fontWeight: 600,
        bgcolor: 'var(--color-cta)',
        color: 'var(--glass-text-white-heavy)',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: 'var(--primary-active)',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
        },
      }}
    >
      使用 Google 登录
    </Button>
  );
}
