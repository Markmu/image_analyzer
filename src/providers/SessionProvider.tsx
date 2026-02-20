'use client';

import { useState } from 'react';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
    </QueryClientProvider>
  );
}
