import type { Metadata } from 'next';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getCart } from '@/server/cart';
import { isStripeConfigured } from '@/lib/stripe';
import { isCloudinaryConfigured } from '@/lib/cloudinary';
import { buttonVariants } from '@/components/ui/button';
import { CheckoutForm, type CheckoutLine } from '@/components/checkout/checkout-form';
import { Container } from '@/components/ui/container';

export const metadata: Metadata = { title: 'Checkout' };

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) return <GuestGate />;
  return <AuthedCheckout userId={user.id} email={user.email ?? ''} />;
}

/** Unauthenticated visitors must sign in first (cart is per-account). */
function GuestGate() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <ShoppingBag className="mx-auto size-10 text-muted-foreground" strokeWidth={1} />
      <h1 className="mt-6 font-display text-3xl tracking-tight text-foreground">
        Sign in to check out
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Your bag is saved to your account. Sign in or create one to continue.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/login?callbackUrl=/checkout"
          className={buttonVariants({ size: 'lg', className: 'w-full' })}
        >
          Sign in
        </Link>
        <Link
          href="/register?callbackUrl=/checkout"
          className={buttonVariants({
            variant: 'outline',
            size: 'lg',
            className: 'w-full',
          })}
        >
          Create account
        </Link>
      </div>
    </div>
  );
}

async function AuthedCheckout({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  const [cart, address] = await Promise.all([
    getCart(userId),
    prisma.address.findFirst({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    }),
  ]);

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <ShoppingBag
          className="mx-auto size-10 text-muted-foreground"
          strokeWidth={1}
        />
        <h1 className="mt-6 font-display text-3xl tracking-tight text-foreground">
          Your bag is empty
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Add something you love before checking out.
        </p>
        <Link
          href="/shop"
          className={buttonVariants({ size: 'lg', className: 'mt-8' })}
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  const lines: CheckoutLine[] = cart.lines.map((l) => ({
    variantId: l.variantId,
    name: l.name,
    size: l.size,
    color: l.color,
    quantity: l.quantity,
    unitPrice: l.unitPrice,
    lineTotal: l.lineTotal,
    image: l.image,
  }));

  const prefill = {
    email,
    fullName: address?.fullName ?? '',
    phone: address?.phone ?? '',
    line1: address?.line1 ?? '',
    line2: address?.line2 ?? '',
    city: address?.city ?? '',
    state: address?.state ?? '',
    postalCode: address?.postalCode ?? '',
  };

  return (
    <Container size="lg" className="py-12 sm:py-16">
      <div className="mb-10">
        <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent">
          Secure Checkout
        </span>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-foreground sm:text-4xl">
          Checkout
        </h1>
      </div>
      <CheckoutForm
        lines={lines}
        subtotal={cart.subtotal}
        itemCount={cart.itemCount}
        stripeEnabled={isStripeConfigured}
        easypaisa={{
          enabled: isCloudinaryConfigured,
          name: process.env.NEXT_PUBLIC_EASYPAISA_NAME ?? 'MTK Store',
          number: process.env.NEXT_PUBLIC_EASYPAISA_NUMBER ?? '',
        }}
        prefill={prefill}
      />
    </Container>
  );
}
