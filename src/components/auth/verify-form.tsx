'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  verifyOtpAction,
  resendOtpAction,
  type ActionState,
} from '@/server/actions/auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/auth/submit-button';

const initial: ActionState = {};

export function VerifyForm({ email }: { email: string }) {
  const [state, formAction] = useActionState(verifyOtpAction, initial);
  const [resendState, resendAction] = useActionState(resendOtpAction, initial);
  const router = useRouter();
  const [resent, setResent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // On successful verification, send them to sign in.
  useEffect(() => {
    if (state.success) {
      router.push('/login?verified=1');
    }
  }, [state.success, router]);

  // Show a "code sent" confirmation when a resend succeeds.
  useEffect(() => {
    if (resendState.success) {
      setResent(true);
      const t = setTimeout(() => setResent(false), 6000);
      return () => clearTimeout(t);
    }
  }, [resendState.success]);

  if (!email) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-[2rem] font-medium tracking-tight text-foreground">
          Verify your email
        </h1>
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t determine which email to verify.{' '}
          <Link
            href="/register"
            className="font-medium text-accent underline underline-offset-4"
          >
            Create an account
          </Link>{' '}
          to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent">
          Almost there
        </span>
        <h1 className="font-display text-[2rem] font-medium tracking-tight text-foreground">
          Verify your email
        </h1>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to{' '}
          <span className="font-medium text-foreground">{email}</span>. Enter it
          below to activate your account.
        </p>
      </div>

      {state.error && (
        <p
          role="alert"
          className="border-l-2 border-red-500 bg-red-50 px-5 py-4 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      {resent && !state.error && (
        <p
          role="status"
          className="border-l-2 border-accent bg-muted/50 px-5 py-4 text-sm text-foreground"
        >
          A new code is on its way. Check your inbox (and spam folder).
        </p>
      )}

      <form ref={formRef} action={formAction} className="space-y-6" noValidate>
        <input type="hidden" name="email" value={email} />
        <div className="space-y-3">
          <Label htmlFor="code">Verification code</Label>
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="\d{6}"
            placeholder="000000"
            required
            autoFocus
            className="text-center text-2xl tracking-[0.5em]"
          />
        </div>
        <SubmitButton size="lg" className="w-full" loadingText="Verifying…">
          Verify &amp; continue
        </SubmitButton>
      </form>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Didn&apos;t get it?</span>
        <form action={resendAction}>
          <input type="hidden" name="email" value={email} />
          <button
            type="submit"
            className="font-medium text-accent underline underline-offset-4"
          >
            Resend code
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Entered the wrong email?{' '}
        <Link
          href="/register"
          className="font-medium text-accent underline underline-offset-4"
        >
          Start over
        </Link>
      </p>
    </div>
  );
}
