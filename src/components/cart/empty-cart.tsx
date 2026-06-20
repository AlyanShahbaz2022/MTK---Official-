import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center gap-7 py-8 text-center">
      <ShoppingBag className="size-12 text-muted-foreground" strokeWidth={1} />
      <p className="text-base text-muted-foreground">Your cart is empty.</p>
      <Link href="/shop" className={buttonVariants({ size: 'lg' })}>
        Start shopping
      </Link>
    </div>
  );
}
