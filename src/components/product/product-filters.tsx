'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { sortOptions } from '@/schemas/catalog';

interface Props {
  sizes: string[];
  colors: string[];
}

/** URL-driven filter + sort controls for listing pages. */
export function ProductFiltersBar({ sizes, colors }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page'); // reset pagination on filter change
    router.push(`${pathname}?${next.toString()}`);
  }

  const selectClass =
    'h-10 rounded-xs border border-text-primary/20 bg-background px-5 text-lg text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <div className="flex flex-wrap items-center gap-5">
      <select
        aria-label="Size"
        className={selectClass}
        value={params.get('size') ?? ''}
        onChange={(e) => update('size', e.target.value)}
      >
        <option value="">All sizes</option>
        {sizes.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        aria-label="Color"
        className={selectClass}
        value={params.get('color') ?? ''}
        onChange={(e) => update('color', e.target.value)}
      >
        <option value="">All colors</option>
        {colors.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        aria-label="Sort by"
        className={`${selectClass} ml-auto`}
        value={params.get('sort') ?? 'newest'}
        onChange={(e) => update('sort', e.target.value)}
      >
        {sortOptions.map((s) => (
          <option key={s} value={s}>
            {sortLabels[s]}
          </option>
        ))}
      </select>
    </div>
  );
}

const sortLabels: Record<(typeof sortOptions)[number], string> = {
  newest: 'Newest',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  rating: 'Top Rated',
};
