'use client';

import { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerAction, type ActionState } from '@/server/actions/auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/auth/submit-button';

const initial: ActionState = {};

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initial);
  const router = useRouter();

  useEffect(() => {
    if (state.success && state.verifyEmail) {
      router.push(`/verify?email=${encodeURIComponent(state.verifyEmail)}`);
    }
  }, [state.success, state.verifyEmail, router]);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent">
          Join MTK
        </span>
        <h1 className="font-display text-[2rem] font-medium tracking-tight text-foreground">
          Create account
        </h1>
      </div>

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
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" type="text" autoComplete="name" required />
        </div>
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
            autoComplete="new-password"
            required
          />
          <p className="text-xs text-muted-foreground">
            8+ chars with upper, lower, number &amp; symbol.
          </p>
        </div>
        <div className="space-y-3">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>
        <SubmitButton size="lg" className="w-full" loadingText="Creating…">
          Create account
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-accent underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
