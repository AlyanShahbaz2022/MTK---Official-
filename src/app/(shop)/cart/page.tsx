import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/session';
import { getCart } from '@/server/cart';
import { CartLine } from '@/components/cart/cart-line';
import { CartSummary } from '@/components/cart/cart-summary';
import { EmptyCart } from '@/components/cart/empty-cart';
import { GuestCartView } from '@/components/cart/guest-cart-view';

export const metadata: Metadata = { title: 'Cart' };

export default async function CartPage() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto max-w-screen-2xl px-6 py-14 md:px-10 md:py-20">
      <div className="mb-10 text-center">
        <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent">
          Your Selection
        </span>
        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
          Shopping Bag
        </h1>
      </div>
      {user ? <AuthedCart userId={user.id} /> : <GuestCartView />}
    </main>
  );
}

async function AuthedCart({ userId }: { userId: string }) {
  const cart = await getCart(userId);
  if (cart.lines.length === 0) return <EmptyCart />;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div className="border-t border-primary/10">
        {cart.lines.map((line) => (
          <CartLine key={line.itemId} line={line} />
        ))}
      </div>
      <CartSummary subtotal={cart.subtotal} itemCount={cart.itemCount} />
    </div>
  );
}
