'use client';

import { signIn } from 'next-auth/react';

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
    <button
      onClick={handleSignIn}
      data-testid="google-login-button"
      style={{
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: '#4285f4',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="white" />
        <text x="12" y="16" textAnchor="middle" fontSize="11" fill="#4285f4" fontFamily="Arial, sans-serif">
          G
        </text>
      </svg>
      使用 Google 登录
    </button>
  );
}
