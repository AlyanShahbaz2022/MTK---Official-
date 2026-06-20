import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

/** Order summary box shown beside the cart lines. */
export function CartSummary({
  subtotal,
  itemCount,
}: {
  subtotal: number;
  itemCount: number;
}) {
  return (
    <div className="space-y-6 rounded-md border border-text-primary/10 p-7">
      <h2 className="text-2xl font-semibold uppercase tracking-tight">
        Summary
      </h2>
      <div className="flex justify-between text-base">
        <span className="text-muted-foreground">
          Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </span>
        <span className="font-medium">{formatPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between text-md uppercase tracking-widest text-muted-foreground">
        <span>Shipping</span>
        <span>Calculated at checkout</span>
      </div>
      <Link
        href="/checkout"
        className={buttonVariants({ size: 'lg', className: 'w-full' })}
      >
        Checkout
      </Link>
      <Link
        href="/shop"
        className="block text-center text-lg text-text-primary underline"
      >
        Continue shopping
      </Link>
    </div>
  );
}
