import 'server-only';
import { randomInt } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/mailer';
import { otpEmailTemplate } from '@/lib/email-templates';

// 6-digit code, valid for 10 minutes. Max 5 wrong guesses before it's voided.
const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const SALT_ROUNDS = 10;

function generateCode(): string {
  // 000000–999999, always padded to 6 digits.
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

/**
 * Create (or replace) the pending OTP for an email and send it.
 * Upserts so a resend overwrites any previous code and resets attempts.
 */
export async function createAndSendOtp(email: string): Promise<void> {
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, SALT_ROUNDS);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.emailOtp.upsert({
    where: { email },
    update: { codeHash, expiresAt, attempts: 0, createdAt: new Date() },
    create: { email, codeHash, expiresAt },
  });

  const { subject, html, text } = otpEmailTemplate(code);
  await sendMail({ to: email, subject, html, text });
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Verify a submitted code. On success the OTP row is consumed (deleted) and the
 * caller should mark the user's email verified. Brute force is bounded by
 * MAX_ATTEMPTS and the 10-minute expiry.
 */
export async function verifyOtp(email: string, code: string): Promise<VerifyResult> {
  const record = await prisma.emailOtp.findUnique({ where: { email } });
  if (!record) {
    return { ok: false, error: 'No verification code found. Please request a new one.' };
  }

  if (record.expiresAt.getTime() <= Date.now()) {
    await prisma.emailOtp.delete({ where: { email } }).catch(() => {});
    return { ok: false, error: 'This code has expired. Please request a new one.' };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await prisma.emailOtp.delete({ where: { email } }).catch(() => {});
    return { ok: false, error: 'Too many incorrect attempts. Please request a new code.' };
  }

  const matches = await bcrypt.compare(code, record.codeHash);
  if (!matches) {
    await prisma.emailOtp.update({
      where: { email },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, error: 'Incorrect code. Please try again.' };
  }

  // Consume the code so it can't be reused.
  await prisma.emailOtp.delete({ where: { email } }).catch(() => {});
  return { ok: true };
}
