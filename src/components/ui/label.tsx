import * as React from 'react';
import { cn } from '@/lib/utils';

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'text-lg font-medium uppercase tracking-wide text-text-primary',
      className,
    )}
    {...props}
  />
));
Label.displayName = 'Label';

export { Label };
