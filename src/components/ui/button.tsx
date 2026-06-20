import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Button — MTK luxury design system.
 * Sharp edges, generous tracking, restrained hover (no bounce/scale jumps).
 * States: default, hover, focus-visible, active, disabled.
 * Variant/size keys are kept stable so existing pages keep working.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-none font-sans font-medium uppercase tracking-[0.15em] transition-all duration-fast ease-luxe focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:opacity-90',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground hover:bg-dark-gray',
        outline:
          'border border-primary/30 bg-transparent text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground',
        ghost: 'bg-transparent text-foreground hover:text-accent',
        accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
      },
      size: {
        sm: 'h-10 px-6 text-[11px]',
        md: 'h-12 px-8 text-[12px]',
        lg: 'h-14 px-10 text-[13px]',
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
