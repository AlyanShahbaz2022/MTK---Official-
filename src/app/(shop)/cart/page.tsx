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
    <main className="mx-auto max-w-6xl px-8 py-8">
      <h1 className="mb-8 text-4xl font-semibold uppercase tracking-tight">
        Your cart
      </h1>
      {user ? <AuthedCart userId={user.id} /> : <GuestCartView />}
    </main>
  );
}

async function AuthedCart({ userId }: { userId: string }) {
  const cart = await getCart(userId);
  if (cart.lines.length === 0) return <EmptyCart />;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        {cart.lines.map((line) => (
          <CartLine key={line.itemId} line={line} />
        ))}
      </div>
      <CartSummary subtotal={cart.subtotal} itemCount={cart.itemCount} />
    </div>
  );
}
