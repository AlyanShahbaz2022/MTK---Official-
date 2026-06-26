import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center gap-7 py-24 text-center">
      <ShoppingBag className="size-12 text-muted-foreground" strokeWidth={1} />
      <div className="space-y-2">
        <p className="font-display text-2xl tracking-tight text-foreground">
          Your bag is empty
        </p>
        <p className="text-sm text-muted-foreground">
          Discover our latest collections and add your favourites.
        </p>
      </div>
      <Link href="/shop" className={buttonVariants({ size: 'lg' })}>
        Start shopping
      </Link>
    </div>
  );
}
