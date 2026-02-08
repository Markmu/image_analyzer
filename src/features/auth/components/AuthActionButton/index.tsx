'use client';

import { useSession } from 'next-auth/react';
import { SignInButton } from '@/features/auth/components/SignInButton';
import { SignOutButton } from '@/features/auth/components/SignOutButton';

export function AuthActionButton() {
  const { status } = useSession();

  if (status === 'loading') {
    return null;
  }

  return status === 'authenticated' ? <SignOutButton /> : <SignInButton />;
}
