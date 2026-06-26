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
    <div className="h-fit space-y-7 border border-primary/10 bg-muted/30 p-8 lg:sticky lg:top-28">
      <h2 className="font-display text-2xl tracking-tight text-foreground">
        Order Summary
      </h2>

      <div className="space-y-4 border-y border-primary/10 py-6">
        <div className="flex justify-between text-base">
          <span className="text-muted-foreground">
            Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
          <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <span>Shipping</span>
          <span>Calculated at checkout</span>
        </div>
      </div>

      <div className="flex justify-between text-base">
        <span className="font-medium text-foreground">Total</span>
        <span className="font-display text-xl text-foreground">
          {formatPrice(subtotal)}
        </span>
      </div>

      <Link
        href="/checkout"
        className={buttonVariants({ size: 'lg', className: 'w-full' })}
      >
        Proceed to Checkout
      </Link>
      <Link
        href="/shop"
        className="block text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground underline underline-offset-4 transition-colors duration-fast hover:text-accent"
      >
        Continue shopping
      </Link>
    </div>
  );
}
