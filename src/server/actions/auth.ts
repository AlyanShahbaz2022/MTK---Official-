'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { AuthError } from 'next-auth';
import { signIn, signOut } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/password';
import {
  registerSchema,
  loginSchema,
  otpSchema,
  resendOtpSchema,
} from '@/schemas/auth';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';
import { getRequestInfo } from '@/lib/request-info';
import { createAndSendOtp, verifyOtp } from '@/server/otp';

export type ActionState = {
  error?: string;
  success?: boolean;
  // Set when registration succeeds and the user must verify their email next.
  verifyEmail?: string;
};

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
  if (existing && existing.emailVerified) {
    // Fully registered + verified — block.
    return { error: 'An account with this email already exists.' };
  }

  const passwordHash = await hashPassword(password);

  // New user OR an unverified user retrying signup (update their details).
  const user = existing
    ? await prisma.user.update({
        where: { email },
        data: { name, passwordHash },
      })
    : await prisma.user.create({
        data: { name, email, passwordHash },
      });

  // Send the verification code. If email delivery fails, surface a clear error
  // (the account stays unverified and can be retried).
  try {
    await createAndSendOtp(email);
  } catch (err) {
    console.error('Failed to send OTP email:', err);
    return {
      error: 'We could not send your verification email. Please try again.',
    };
  }

  await logAudit({
    action: 'REGISTER',
    userId: user.id,
    email,
    ip,
    userAgent,
  });

  return { success: true, verifyEmail: email };
}

/** Verify the 6-digit email OTP and mark the account verified. */
export async function verifyOtpAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { ip } = await getRequestInfo();

  const parsed = otpSchema.safeParse({
    email: formData.get('email'),
    code: formData.get('code'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid code' };
  }
  const { email, code } = parsed.data;

  // Bound verification attempts per IP as a second line of defence.
  const rl = await rateLimit(`otp:verify:${ip}`, 20, WINDOW_MS);
  if (!rl.success) {
    return { error: 'Too many attempts. Please try again later.' };
  }

  const result = await verifyOtp(email, code);
  if (!result.ok) {
    return { error: result.error };
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  return { success: true };
}

/** Resend a fresh OTP to an unverified email. */
export async function resendOtpAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { ip } = await getRequestInfo();

  const parsed = resendOtpSchema.safeParse({ email: formData.get('email') });
  if (!parsed.success) {
    return { error: 'Invalid email.' };
  }
  const { email } = parsed.data;

  // Limit resends to curb email abuse (3 per window per email + per IP).
  const byEmail = await rateLimit(`otp:resend:email:${email}`, 3, WINDOW_MS);
  const byIp = await rateLimit(`otp:resend:ip:${ip}`, 10, WINDOW_MS);
  if (!byEmail.success || !byIp.success) {
    return { error: 'Too many requests. Please wait a few minutes.' };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  // Only resend for an existing, still-unverified account. Stay vague either way.
  if (user && !user.emailVerified) {
    try {
      await createAndSendOtp(email);
    } catch (err) {
      console.error('Failed to resend OTP email:', err);
      return { error: 'Could not send the email. Please try again.' };
    }
  }

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

  // If the credentials are valid but the email isn't verified yet, route the
  // user to verification instead of showing a generic failure.
  const user = await prisma.user.findUnique({ where: { email } });
  if (user?.passwordHash && !user.emailVerified) {
    const ok = await verifyPassword(parsed.data.password, user.passwordHash);
    if (ok) {
      // Make sure a fresh code is waiting for them.
      try {
        await createAndSendOtp(email);
      } catch {
        // Non-fatal; they can resend on the verify page.
      }
      return {
        error: 'Please verify your email to continue. We sent you a new code.',
        verifyEmail: email,
      };
    }
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
