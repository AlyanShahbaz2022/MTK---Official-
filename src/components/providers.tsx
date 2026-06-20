'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { useState, type ReactNode } from 'react';
import { CartMerge } from '@/components/cart/cart-merge';

/** App-wide client providers (Auth.js session + TanStack Query). */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <CartMerge />
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
