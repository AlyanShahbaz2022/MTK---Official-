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
    if (state.success) {
      router.push('/login?registered=1');
    }
  }, [state.success, router]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold uppercase tracking-tight text-text-primary">
          Create account
        </h1>
        <p className="text-lg text-muted-foreground">Join MTK.</p>
      </div>

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
          <p className="text-md text-muted-foreground">
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

      <p className="text-center text-lg text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-text-primary underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
