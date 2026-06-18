'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { AuthError } from 'next-auth';
import { signIn, signOut } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { registerSchema, loginSchema } from '@/schemas/auth';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';
import { getRequestInfo } from '@/lib/request-info';

export type ActionState = { error?: string; success?: boolean };

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/** Register a new credentials user. */
export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { ip, userAgent } = await getRequestInfo();

  // Rate limit registrations per IP (spec §6.7).
  const rl = await rateLimit(`register:${ip}`, 5, WINDOW_MS);
  if (!rl.success) {
    return { error: 'Too many attempts. Please try again later.' };
  }

  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Don't reveal which step failed beyond necessity.
    return { error: 'An account with this email already exists.' };
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  await logAudit({
    action: 'REGISTER',
    userId: user.id,
    email,
    ip,
    userAgent,
  });

  return { success: true };
}

/** Log in with credentials (brute-force protected + audited). */
export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { ip, userAgent } = await getRequestInfo();

  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: 'Invalid email or password.' };
  }
  const { email } = parsed.data;

  // Limit attempts per IP AND per email (spec §6.8).
  const byIp = await rateLimit(`login:ip:${ip}`, 10, WINDOW_MS);
  const byEmail = await rateLimit(`login:email:${email}`, 5, WINDOW_MS);
  if (!byIp.success || !byEmail.success) {
    await logAudit({
      action: 'LOGIN_FAILED',
      email,
      ip,
      userAgent,
      meta: { reason: 'rate_limited' },
    });
    return { error: 'Too many attempts. Please try again later.' };
  }

  try {
    await signIn('credentials', {
      email,
      password: parsed.data.password,
      redirectTo: '/account',
    });
    // signIn redirects on success; this is effectively unreachable.
    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) throw error; // let the redirect propagate
    if (error instanceof AuthError) {
      await logAudit({
        action: 'LOGIN_FAILED',
        email,
        ip,
        userAgent,
        meta: { reason: error.type },
      });
      return { error: 'Invalid email or password.' };
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: '/' });
}
