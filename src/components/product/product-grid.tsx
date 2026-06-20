import Link from 'next/link';
import { PackageOpen } from 'lucide-react';
import { ProductCard } from '@/components/product/product-card';
import { buttonVariants } from '@/components/ui/button';
import type { ProductCard as ProductCardData } from '@/server/products';

export function ProductGrid({
  products,
  basePath = '/shop',
}: {
  products: ProductCardData[];
  basePath?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-24 text-center">
        <PackageOpen className="size-10 text-muted-foreground" strokeWidth={1} />
        <div className="space-y-2">
          <p className="font-display text-2xl tracking-tight text-foreground">
            Nothing matches those filters
          </p>
          <p className="text-sm text-muted-foreground">
            Try adjusting or clearing your filters to see more.
          </p>
        </div>
        <Link href={basePath} className={buttonVariants({ variant: 'outline' })}>
          View all
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-7">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
