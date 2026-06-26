import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { requireUser } from '@/lib/session';
import { getUserOrder } from '@/server/orders';
import { formatPrice } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Order confirmed' };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const user = await requireUser();
  const { order: orderNumber } = await searchParams;
  if (!orderNumber) notFound();

  const order = await getUserOrder(user.id, orderNumber);
  if (!order) notFound();

  const paid = order.paymentStatus === 'PAID';
  const cod = order.paymentMethod === 'COD';
  const easypaisaPending =
    order.paymentMethod === 'EASYPAISA' && order.paymentStatus === 'UNPAID';

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-14 text-green-600" strokeWidth={1.25} />
        <h1 className="mt-6 font-display text-3xl tracking-tight text-foreground sm:text-4xl">
          Thank you{order.fullName ? `, ${order.fullName.split(' ')[0]}` : ''}!
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          {easypaisaPending ? (
            <>
              We&apos;ve received your order{' '}
              <span className="font-medium text-foreground">{order.orderNumber}</span>{' '}
              and your payment screenshot. We&apos;ll verify your EasyPaisa transfer and
              email you at {order.email} once it&apos;s confirmed — usually within a few
              hours.
            </>
          ) : (
            <>
              Your order{' '}
              <span className="font-medium text-foreground">{order.orderNumber}</span>{' '}
              is confirmed.{' '}
              {cod
                ? 'Pay in cash when it arrives.'
                : paid
                  ? 'Payment received.'
                  : 'We’ll confirm your payment shortly.'}{' '}
              A confirmation has been sent to {order.email}.
            </>
          )}
        </p>
      </div>

      <div className="mt-10 border border-primary/10 bg-muted/20 p-7">
        <ul className="space-y-4 border-b border-primary/10 pb-6">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-4">
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
                <p className="truncate text-sm font-medium text-foreground">
                  {item.productName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.variantLabel} · Qty {item.quantity}
                </p>
              </div>
              <span className="text-sm text-foreground">{formatPrice(item.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <dl className="space-y-2 py-6 text-sm">
          <Line label="Subtotal">{formatPrice(order.subtotal)}</Line>
          <Line label="Shipping">
            {order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}
          </Line>
          {order.discount > 0 && (
            <Line label={`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`}>
              −{formatPrice(order.discount)}
            </Line>
          )}
        </dl>

        <div className="flex items-center justify-between border-t border-primary/10 pt-5">
          <span className="font-medium text-foreground">Total</span>
          <span className="font-display text-2xl text-foreground">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-2 border border-primary/10 p-6 text-sm">
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
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href={`/account/orders/${order.orderNumber}`}
          className={buttonVariants({ variant: 'outline', size: 'lg' })}
        >
          View order
        </Link>
        <Link href="/shop" className={buttonVariants({ size: 'lg' })}>
          Continue shopping
        </Link>
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
