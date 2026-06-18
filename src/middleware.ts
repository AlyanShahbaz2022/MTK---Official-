import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth.config';

// Edge-safe auth instance (no Prisma) — JWT session is readable here.
const { auth } = NextAuth(authConfig);

/**
 * Route protection + RBAC (spec project.md §6.5).
 * - /admin/*   -> ADMIN only
 * - /account/* -> any authenticated user
 * Unauthenticated users are redirected to /login with a callback.
 */
export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;

  const isAdminRoute = nextUrl.pathname.startsWith('/admin');
  const isAccountRoute = nextUrl.pathname.startsWith('/account');

  if (isAdminRoute) {
    if (!isLoggedIn) return redirectToLogin(req);
    if (role !== 'ADMIN') {
      return NextResponse.rewrite(new URL('/403', nextUrl));
    }
  }

  if (isAccountRoute && !isLoggedIn) {
    return redirectToLogin(req);
  }

  return NextResponse.next();
});

function redirectToLogin(req: Parameters<Parameters<typeof auth>[0]>[0]) {
  const url = new URL('/login', req.nextUrl);
  url.searchParams.set('callbackUrl', req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // Run on app routes; skip static assets + the auth API.
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
