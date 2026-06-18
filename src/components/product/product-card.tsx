import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import type { ProductCard as ProductCardData } from '@/server/products';

/** Product card — links to detail page. Used in grids across the site. */
export function ProductCard({ product }: { product: ProductCardData }) {
  const image = product.images[0];

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block focus-visible:outline-none"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-fast group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-md uppercase tracking-widest text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <div className="space-y-2 py-5">
        <h3 className="text-2xl font-medium text-text-primary group-hover:underline">
          {product.name}
        </h3>
        <p className="text-xl text-text-primary">
          {formatPrice(product.basePrice)}
        </p>
      </div>
    </Link>
  );
}
