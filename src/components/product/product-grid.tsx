import { ProductCard } from '@/components/product/product-card';
import type { ProductCard as ProductCardData } from '@/server/products';

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) {
    return (
      <p className="py-8 text-center text-base text-muted-foreground">
        No products found.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-7 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
