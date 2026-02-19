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
      className="ia-glass-card ia-glass-card--static ia-glass-card--heavy sticky top-0 z-50 flex items-center justify-between px-6 py-3"
      style={{
        borderRadius: 0,
        borderLeft: 0,
        borderRight: 0,
        borderTop: 0,
        borderBottom: '1px solid var(--glass-border-white-medium)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3), 0 0 40px rgba(59, 130, 246, 0.1)',
        background: 'var(--glass-bg-dark-heavy)',
      }}
    >
      <Link
        href="/"
        className="text-xl font-bold tracking-tight"
        style={{
          color: 'var(--glass-text-white-heavy)',
          textShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
        }}
      >
        Image Analyzer
      </Link>

      <nav className="flex items-center gap-6" aria-label="主导航">
        <Link
          href="/"
          className="transition-colors duration-200 hover:opacity-100"
          style={{
            color: 'var(--glass-text-white-medium)',
            fontWeight: 500,
          }}
        >
          首页
        </Link>
        <Link
          href="/analysis"
          className="transition-colors duration-200 hover:opacity-100"
          style={{
            color: 'var(--glass-text-white-medium)',
            fontWeight: 500,
          }}
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
