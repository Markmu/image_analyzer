'use client';

import { useSession } from 'next-auth/react';
import { UserMenu } from '@/features/auth/components/UserMenu';
import { SignInButton } from '@/features/auth/components/SignInButton';

export function Header() {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <header className="flex items-center justify-between p-4 border-b border-slate-800">
      {/* Logo - 占位符 */}
      <div className="text-xl font-bold text-slate-100">
        Image Analyzer
      </div>

      {/* Navigation - 占位符 */}
      <nav className="hidden md:flex gap-6">
        <a href="/" className="text-slate-300 hover:text-white">
          首页
        </a>
      </nav>

      {/* 右侧：登录状态相关 */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <UserMenu />
        ) : (
          <SignInButton />
        )}
      </div>
    </header>
  );
}
