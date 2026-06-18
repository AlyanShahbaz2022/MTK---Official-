'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function GoogleButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="md"
      className="w-full"
      onClick={() => signIn('google', { callbackUrl: '/account' })}
    >
      Continue with Google
    </Button>
  );
}
