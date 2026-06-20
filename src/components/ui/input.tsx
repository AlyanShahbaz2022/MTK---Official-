import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Input — MTK luxury design system.
 * Underline-style field (no heavy box), gold focus ring.
 * States: default / focus-visible / disabled / error.
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      aria-invalid={error || undefined}
      className={cn(
        'flex h-12 w-full rounded-none border-0 border-b bg-transparent px-1 text-base text-foreground transition-colors duration-fast ease-luxe placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50',
        error ? 'border-red-600' : 'border-primary/20 hover:border-primary/40',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export { Input };
