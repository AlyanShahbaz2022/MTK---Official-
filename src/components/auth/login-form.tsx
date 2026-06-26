'use client';

import { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginAction, type ActionState } from '@/server/actions/auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/auth/submit-button';
import { GoogleButton } from '@/components/auth/google-button';

const initial: ActionState = {};

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initial);
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === '1';
  const justVerified = searchParams.get('verified') === '1';

  // Unverified credentials → send them to verify their email.
  useEffect(() => {
    if (state.verifyEmail) {
      router.push(`/verify?email=${encodeURIComponent(state.verifyEmail)}`);
    }
  }, [state.verifyEmail, router]);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent">
          Welcome back
        </span>
        <h1 className="font-display text-[2rem] font-medium tracking-tight text-foreground">
          Sign in
        </h1>
      </div>

      {justVerified && !state.error && (
        <p
          role="status"
          className="border-l-2 border-accent bg-muted/50 px-5 py-4 text-sm text-foreground"
        >
          Email verified. Please sign in.
        </p>
      )}

      {justRegistered && !justVerified && !state.error && (
        <p
          role="status"
          className="border-l-2 border-accent bg-muted/50 px-5 py-4 text-sm text-foreground"
        >
          Account created. Please sign in.
        </p>
      )}

      {state.error && (
        <p
          role="alert"
          className="border-l-2 border-red-500 bg-red-50 px-5 py-4 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      <form action={formAction} className="space-y-6" noValidate>
        <div className="space-y-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <SubmitButton size="lg" className="w-full" loadingText="Signing in…">
          Sign in
        </SubmitButton>
      </form>

      <div className="flex items-center gap-5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        <span className="h-px flex-1 bg-primary/10" />
        or
        <span className="h-px flex-1 bg-primary/10" />
      </div>

      <GoogleButton />

      <p className="text-center text-sm text-muted-foreground">
        No account?{' '}
        <Link href="/register" className="font-medium text-accent underline underline-offset-4">
          Create one
        </Link>
      </p>
    </div>
  );
}
