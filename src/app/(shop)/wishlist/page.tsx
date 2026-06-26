import type { Metadata } from 'next';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { requireUser } from '@/lib/session';
import { getWishlist, unitPrice } from '@/server/cart';
import { WishlistItem } from '@/components/cart/wishlist-item';
import { buttonVariants } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

export const metadata: Metadata = { title: 'Wishlist' };

export default async function WishlistPage() {
  const user = await requireUser();
  const items = await getWishlist(user.id);

  return (
    <Container as="main" size="sm" className="py-14 md:py-20">
      <div className="mb-10 text-center">
        <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent">
          Saved for Later
        </span>
        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
          Wishlist
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-7 py-20 text-center">
          <Heart className="size-12 text-muted-foreground" strokeWidth={1} />
          <div className="space-y-2">
            <p className="font-display text-2xl tracking-tight text-foreground">
              Your wishlist is empty
            </p>
            <p className="text-sm text-muted-foreground">
              Save the pieces you love to find them here.
            </p>
          </div>
          <Link href="/shop" className={buttonVariants({ size: 'lg' })}>
            Browse products
          </Link>
        </div>
      ) : (
        <div className="border-t border-primary/10">
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
    </Container>
  );
}
