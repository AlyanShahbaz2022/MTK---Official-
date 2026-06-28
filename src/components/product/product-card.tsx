import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import type { ProductCard as ProductCardData } from '@/server/products';

/** Product card — editorial luxury style with hover zoom + reveal overlay. */
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
            className="object-cover transition-transform duration-1200 ease-luxe group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            No image
          </div>
        )}

        {/* Hover reveal: subtle veil + view label */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-fast ease-luxe group-hover:opacity-100" />
        <span className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 translate-y-2 text-[11px] font-medium uppercase tracking-[0.25em] text-light-gray opacity-0 transition-all duration-fast ease-luxe group-hover:translate-y-0 group-hover:opacity-100">
          View Product
        </span>
      </div>

      <div className="space-y-1.5 pt-5 text-center">
        <h3 className="text-sm font-medium tracking-wide text-foreground transition-colors duration-fast group-hover:text-accent">
          {product.name}
        </h3>
        {product.ratingCount > 0 && (
          <p className="text-xs text-muted-foreground">
            <span className="text-accent">★</span>{' '}
            {product.ratingAvg.toFixed(1)} ({product.ratingCount})
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          {formatPrice(product.basePrice)}
        </p>
      </div>
    </Link>
  );
}
