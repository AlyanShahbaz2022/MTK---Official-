'use client';

import { useMemo, useState } from 'react';
import type { ProductVariant } from '@prisma/client';
import { cn, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Props {
  variants: ProductVariant[];
  basePrice: number;
}

/**
 * Size/color selector with stock awareness.
 * Add-to-cart is wired up in Phase 4; for now it reflects selection + stock.
 */
export function VariantSelector({ variants, basePrice }: Props) {
  const colors = useMemo(
    () => [...new Set(variants.map((v) => v.color))],
    [variants],
  );
  const sizes = useMemo(
    () => [...new Set(variants.map((v) => v.size))],
    [variants],
  );

  const [color, setColor] = useState(colors[0] ?? '');
  const [size, setSize] = useState(sizes[0] ?? '');

  const selected = variants.find((v) => v.color === color && v.size === size);
  const price = selected?.priceOverride ?? basePrice;
  const inStock = (selected?.stock ?? 0) > 0;

  function sizeInStock(s: string) {
    const v = variants.find((x) => x.color === color && x.size === s);
    return (v?.stock ?? 0) > 0;
  }

  return (
    <div className="space-y-7">
      <p className="text-3xl font-medium text-text-primary">
        {formatPrice(price)}
      </p>

      {/* Color */}
      <div className="space-y-4">
        <p className="text-md uppercase tracking-widest text-muted-foreground">
          Color: <span className="text-text-primary">{color}</span>
        </p>
        <div className="flex flex-wrap gap-4">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                'h-11 rounded-xs border px-7 text-lg transition-colors duration-instant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                c === color
                  ? 'border-text-primary bg-text-primary text-text-tertiary'
                  : 'border-text-primary/20 text-text-primary hover:border-text-primary',
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="space-y-4">
        <p className="text-md uppercase tracking-widest text-muted-foreground">
          Size: <span className="text-text-primary">{size}</span>
        </p>
        <div className="flex flex-wrap gap-4">
          {sizes.map((s) => {
            const available = sizeInStock(s);
            return (
              <button
                key={s}
                type="button"
                disabled={!available}
                onClick={() => setSize(s)}
                className={cn(
                  'h-11 min-w-11 rounded-xs border px-6 text-lg transition-colors duration-instant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40',
                  s === size
                    ? 'border-text-primary bg-text-primary text-text-tertiary'
                    : 'border-text-primary/20 text-text-primary hover:border-text-primary',
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <Button size="lg" className="w-full" disabled={!inStock}>
        {inStock ? 'Add to cart' : 'Out of stock'}
      </Button>
      {!inStock && (
        <p className="text-lg text-muted-foreground">
          This combination is currently unavailable.
        </p>
      )}
    </div>
  );
}
