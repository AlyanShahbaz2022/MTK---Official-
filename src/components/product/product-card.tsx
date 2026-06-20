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
            className="object-cover transition-transform duration-[1.2s] ease-luxe group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <div className="space-y-1.5 pt-5 text-center">
        <h3 className="text-sm font-medium tracking-wide text-foreground transition-colors duration-fast group-hover:text-accent">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {formatPrice(product.basePrice)}
        </p>
      </div>
    </Link>
  );
}
