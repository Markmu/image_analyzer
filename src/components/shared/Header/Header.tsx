'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { UserMenu } from '@/features/auth/components/UserMenu';
import { SignInButton } from '@/features/auth/components/SignInButton';

export function Header() {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <header
      className="ia-glass-card ia-glass-card--static sticky top-0 z-50 flex items-center justify-between px-4 py-3"
      style={{
        borderBottom: '1px solid var(--glass-border)',
      }}
    >
      <Link
        href="/"
        className="text-xl font-bold"
        style={{ color: 'var(--glass-text-white-heavy)' }}
      >
        Image Analyzer
      </Link>

      <nav className="flex items-center gap-6" aria-label="主导航">
        <Link
          href="/"
          className="transition-colors duration-200 hover:opacity-100"
          style={{ color: 'var(--glass-text-white-medium)' }}
        >
          首页
        </Link>
        <Link
          href="/analysis"
          className="transition-colors duration-200 hover:opacity-100"
          style={{ color: 'var(--glass-text-white-medium)' }}
        >
          风格分析
        </Link>
      </nav>

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
