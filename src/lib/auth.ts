import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { authConfig } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { loginSchema } from '@/schemas/auth';

/**
 * Full Auth.js instance (Node runtime). Adds Prisma adapter + providers.
 * Credentials provider verifies bcrypt hashes; Google for OAuth.
 * Spec project.md §6.4 (bcrypt), §6.5 (RBAC), §6.9 (sessions).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: false,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(raw) {
        // Re-validate on the server — never trust the client (§6.7).
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });

        // Constant-ish failure: if no user or no password hash, fail.
        if (!user?.passwordHash) return null;

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
});
