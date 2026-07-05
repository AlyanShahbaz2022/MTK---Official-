'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { useState, type ReactNode } from 'react';
import { CartMerge } from '@/components/cart/cart-merge';
import { RouteLoaderProvider } from '@/components/ui/route-loader';

/** App-wide client providers (theme + Auth.js session + TanStack Query + route loader). */
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
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <CartMerge />
          <RouteLoaderProvider>{children}</RouteLoaderProvider>
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
