import type { Metadata } from 'next';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Cart' };

// Placeholder — the full cart is built in Phase 4.
export default function CartPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center gap-7 px-8 py-8 text-center">
      <h1 className="text-4xl font-semibold uppercase tracking-tight">
        Your cart
      </h1>
      <p className="text-base text-muted-foreground">
        Your cart is empty. The full shopping cart arrives in Phase 4.
      </p>
      <Link href="/shop" className={buttonVariants({ size: 'lg' })}>
        Continue shopping
      </Link>
    </main>
  );
}
