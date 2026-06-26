import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { requireUser } from '@/lib/session';
import { getUserOrders } from '@/server/orders';
import { formatPrice } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { OrderStatusBadge } from '@/components/checkout/order-status-badge';

export default async function OrdersPage() {
  const user = await requireUser();
  const orders = await getUserOrders(user.id);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl tracking-tight text-foreground">Orders</h2>
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
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/account/orders/${order.orderNumber}`}
                className="block border border-primary/10 p-5 transition-colors hover:border-primary/30"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-PK', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="flex -space-x-3">
                    {order.items.slice(0, 4).map((item) =>
                      item.image ? (
                        <div
                          key={item.id}
                          className="relative size-12 overflow-hidden border border-background bg-muted"
                        >
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      ) : null,
                    )}
                    {order.items.length > 4 && (
                      <div className="flex size-12 items-center justify-center border border-background bg-muted text-xs text-muted-foreground">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                  <span className="font-display text-lg text-foreground">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
