import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import type { OrderStatus } from '@prisma/client';
import { requireUser } from '@/lib/session';
import { getUserOrder } from '@/server/orders';
import { formatPrice } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/checkout/order-status-badge';

const TIMELINE: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
];

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const user = await requireUser();
  const { orderNumber } = await params;
  const order = await getUserOrder(user.id, orderNumber);
  if (!order) notFound();

  const cancelled = order.status === 'CANCELLED';
  const currentIdx = TIMELINE.indexOf(order.status);

  return (
    <div className="space-y-8">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-accent"
      >
        <ChevronLeft className="size-4" /> All orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-tight text-foreground">
            {order.orderNumber}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed{' '}
            {new Date(order.createdAt).toLocaleDateString('en-PK', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Timeline */}
      {!cancelled && (
        <ol className="flex items-center">
          {TIMELINE.map((step, i) => {
            const done = i <= currentIdx;
            return (
              <li key={step} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex size-7 items-center justify-center rounded-full border text-[11px] ${
                      done
                        ? 'border-accent bg-accent text-accent-foreground'
                        : 'border-primary/25 text-muted-foreground'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={`mt-2 hidden text-[10px] uppercase tracking-[0.15em] sm:block ${
                      done ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step.toLowerCase()}
                  </span>
                </div>
                {i < TIMELINE.length - 1 && (
                  <span
                    className={`mx-1 h-px flex-1 ${
                      i < currentIdx ? 'bg-accent' : 'bg-primary/20'
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      )}

      {/* Items */}
      <ul className="divide-y divide-primary/10 border-y border-primary/10">
        {order.items.map((item) => (
          <li key={item.id} className="flex gap-4 py-4">
            <div className="relative size-16 shrink-0 overflow-hidden bg-muted">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.productName}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              {item.productSlug ? (
                <Link
                  href={`/product/${item.productSlug}`}
                  className="truncate text-sm font-medium text-foreground hover:text-accent"
                >
                  {item.productName}
                </Link>
              ) : (
                <p className="truncate text-sm font-medium text-foreground">
                  {item.productName}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {item.variantLabel} · Qty {item.quantity}
              </p>
            </div>
            <span className="text-sm text-foreground">{formatPrice(item.lineTotal)}</span>
          </li>
        ))}
      </ul>

      {/* Totals + address */}
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="space-y-2 text-sm">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Shipping to
          </p>
          <p className="text-foreground">{order.fullName}</p>
          <p className="text-muted-foreground">
            {order.line1}
            {order.line2 ? `, ${order.line2}` : ''}, {order.city}
            {order.state ? `, ${order.state}` : ''}
            {order.postalCode ? ` ${order.postalCode}` : ''}, {order.country}
          </p>
          <p className="text-muted-foreground">{order.phone}</p>
          <p className="pt-2 text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
            Payment: {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Card'} ·{' '}
            {order.paymentStatus.toLowerCase()}
          </p>
        </div>

        <dl className="space-y-2 text-sm">
          <Line label="Subtotal">{formatPrice(order.subtotal)}</Line>
          <Line label="Shipping">
            {order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}
          </Line>
          {order.discount > 0 && (
            <Line label={`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`}>
              −{formatPrice(order.discount)}
            </Line>
          )}
          <div className="flex justify-between border-t border-primary/10 pt-3">
            <dt className="font-medium text-foreground">Total</dt>
            <dd className="font-display text-lg text-foreground">
              {formatPrice(order.total)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function Line({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  );
}
