import type { Metadata } from 'next';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { requireUser } from '@/lib/session';
import { getWishlist, unitPrice } from '@/server/cart';
import { WishlistItem } from '@/components/cart/wishlist-item';
import { buttonVariants } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Wishlist' };

export default async function WishlistPage() {
  const user = await requireUser();
  const items = await getWishlist(user.id);

  return (
    <main className="mx-auto max-w-3xl px-8 py-8">
      <h1 className="mb-8 text-4xl font-semibold uppercase tracking-tight">
        Wishlist
      </h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-7 py-8 text-center">
          <Heart className="size-12 text-muted-foreground" strokeWidth={1} />
          <p className="text-base text-muted-foreground">
            Your wishlist is empty.
          </p>
          <Link href="/shop" className={buttonVariants({ size: 'lg' })}>
            Browse products
          </Link>
        </div>
      ) : (
        <div>
          {items.map((item) => (
            <WishlistItem
              key={item.id}
              itemId={item.id}
              name={item.variant.product.name}
              slug={item.variant.product.slug}
              size={item.variant.size}
              color={item.variant.color}
              unitPrice={unitPrice(item.variant)}
              inStock={item.variant.stock > 0}
              image={item.variant.product.images[0]}
            />
          ))}
        </div>
      )}
    </main>
  );
}
