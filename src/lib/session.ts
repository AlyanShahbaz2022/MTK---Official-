import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

/** Current session user, or null. */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** Require any authenticated user (redirects to /login otherwise). */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

/** Require ADMIN role (defense-in-depth alongside middleware). */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect('/403');
  return user;
}
