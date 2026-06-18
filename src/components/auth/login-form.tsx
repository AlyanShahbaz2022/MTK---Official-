'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { loginAction, type ActionState } from '@/server/actions/auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/auth/submit-button';
import { GoogleButton } from '@/components/auth/google-button';

const initial: ActionState = {};

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initial);
  const justRegistered = useSearchParams().get('registered') === '1';

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold uppercase tracking-tight text-text-primary">
          Sign in
        </h1>
        <p className="text-lg text-muted-foreground">
          Welcome back to MTK.
        </p>
      </div>

      {justRegistered && !state.error && (
        <p
          role="status"
          className="rounded-xs bg-muted px-7 py-5 text-lg text-text-primary"
        >
          Account created. Please sign in.
        </p>
      )}

      {state.error && (
        <p
          role="alert"
          className="rounded-xs bg-red-50 px-7 py-5 text-lg text-red-700"
        >
          {state.error}
        </p>
      )}

      <form action={formAction} className="space-y-7" noValidate>
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

      <div className="flex items-center gap-6 text-md uppercase tracking-widest text-muted-foreground">
        <span className="h-px flex-1 bg-text-primary/10" />
        or
        <span className="h-px flex-1 bg-text-primary/10" />
      </div>

      <GoogleButton />

      <p className="text-center text-lg text-muted-foreground">
        No account?{' '}
        <Link href="/register" className="font-medium text-text-primary underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
