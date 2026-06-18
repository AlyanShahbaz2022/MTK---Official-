import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe Auth.js config (no Node-only deps like Prisma/bcrypt).
 * Imported by middleware AND the full auth.ts. Spec §6.4, §6.5, §6.9.
 */
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  // HttpOnly + SameSite + Secure cookies (spec §6.9). Auth.js sets HttpOnly by
  // default; we make SameSite/secure explicit.
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-authjs.session-token'
          : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    // Persist id + role into the JWT, then expose on the session (RBAC §6.5).
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'USER' | 'ADMIN';
      }
      return session;
    },
  },
  providers: [], // populated in auth.ts (kept empty here for edge safety)
} satisfies NextAuthConfig;
