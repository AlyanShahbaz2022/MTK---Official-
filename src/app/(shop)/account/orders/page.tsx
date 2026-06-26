import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { requireUser } from '@/lib/session';
import { buttonVariants } from '@/components/ui/button';

export default async function OrdersPage() {
  await requireUser();

  // Orders backend (Phase 5/6) not yet connected — show the empty state.
  const orders: never[] = [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl tracking-tight text-foreground">
          Orders
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Track and review your past orders.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-5 border border-dashed border-primary/20 py-20 text-center">
          <ShoppingBag className="size-10 text-muted-foreground" strokeWidth={1} />
          <div className="space-y-1.5">
            <p className="font-display text-xl tracking-tight text-foreground">
              No orders yet
            </p>
            <p className="text-sm text-muted-foreground">
              When you place an order, it&apos;ll appear here with live tracking.
            </p>
          </div>
          <Link href="/shop" className={buttonVariants({ size: 'md' })}>
            Start shopping
          </Link>
        </div>
      ) : null}
    </div>
  );
}
