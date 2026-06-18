'use client';

import { useFormStatus } from 'react-dom';
import { Button, type ButtonProps } from '@/components/ui/button';

/** Submit button that reflects the form's pending state (loading). */
export function SubmitButton({
  children,
  loadingText = 'Please wait…',
  ...props
}: ButtonProps & { loadingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-busy={pending} {...props}>
      {pending ? loadingText : children}
    </Button>
  );
}
