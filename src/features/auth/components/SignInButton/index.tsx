'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@mui/material';
import { Chrome } from 'lucide-react';

/**
 * SignInButton 组件 - Google OAuth 登录按钮（简化版）
 *
 * Epic 1 - Story 1.1: OAuth 基础设置
 * 简化版登录按钮，用于测试 OAuth 集成
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
        bgcolor: '#22C55E',
        '&:hover': {
          bgcolor: '#16A34A',
        },
      }}
    >
      使用 Google 登录
    </Button>
  );
}
