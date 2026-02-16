'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { UserMenu } from '@/features/auth/components/UserMenu';
import { SignInButton } from '@/features/auth/components/SignInButton';

export function Header() {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white p-4">
      {/* Logo - 占位符 */}
      <div className="text-xl font-bold text-slate-900">
        Image Analyzer
      </div>

      {/* Navigation - 占位符 */}
      <nav className="hidden md:flex gap-6">
        <Link href="/" className="text-slate-700 hover:text-slate-900">
          首页
        </Link>
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
