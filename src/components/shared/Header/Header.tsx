'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { UserMenu } from '@/features/auth/components/UserMenu';
import { SignInButton } from '@/features/auth/components/SignInButton';

export function Header() {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
      <Link href="/" className="text-xl font-bold text-slate-900">
        Image Analyzer
      </Link>

      <nav className="flex items-center gap-6" aria-label="主导航">
        <Link href="/" className="text-slate-700 hover:text-slate-900">
          首页
        </Link>
        <Link href="/analysis" className="text-slate-700 hover:text-slate-900">
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
