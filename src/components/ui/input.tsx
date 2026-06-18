import * as React from 'react';
import { cn } from '@/lib/utils';

/** Input — MTK design system (states: default/focus-visible/disabled/error). */
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
        'flex h-12 w-full rounded-xs border bg-background px-7 text-base text-text-primary transition-colors duration-instant placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
        error ? 'border-red-600' : 'border-text-primary/20',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export { Input };
