import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Button — MTK design system.
 * States covered: default, hover, focus-visible, active, disabled
 * (loading/error handled by consumers via `disabled` + content swap).
 * Pill radius (radius.lg/xl) per edenrobe tokens.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-2xl font-medium uppercase tracking-wide transition-colors duration-instant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground hover:bg-accent',
        outline:
          'border border-text-primary bg-transparent text-text-primary hover:bg-primary hover:text-primary-foreground',
        ghost: 'bg-transparent text-text-primary hover:bg-muted',
      },
      size: {
        sm: 'h-9 px-6 text-lg',
        md: 'h-11 px-8',
        lg: 'h-14 px-8 text-3xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  ),
);
Button.displayName = 'Button';

export { Button, buttonVariants };
