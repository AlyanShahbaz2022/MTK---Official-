'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import { sortOptions } from '@/schemas/catalog';

interface Props {
  sizes: string[];
  colors: string[];
}

const sortLabels: Record<(typeof sortOptions)[number], string> = {
  newest: 'Newest',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  rating: 'Top Rated',
};

/** URL-driven filter + sort controls (luxury bar + active-filter chips). */
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

  function clearAll() {
    const next = new URLSearchParams(params.toString());
    ['size', 'color', 'sort', 'page'].forEach((k) => next.delete(k));
    router.push(next.toString() ? `${pathname}?${next.toString()}` : pathname);
  }

  const size = params.get('size') ?? '';
  const color = params.get('color') ?? '';
  const sort = params.get('sort') ?? 'newest';
  const hasActive = !!size || !!color || (sort && sort !== 'newest');

  const selectClass =
    'h-11 rounded-none border-0 border-b border-primary/20 bg-transparent pr-7 text-xs font-medium uppercase tracking-[0.12em] text-foreground transition-colors duration-fast hover:border-primary focus-visible:border-accent focus-visible:outline-none';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-x-10 gap-y-4 border-y border-primary/10 py-5">
        <label className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Size
          </span>
          <select
            aria-label="Filter by size"
            className={selectClass}
            value={size}
            onChange={(e) => update('size', e.target.value)}
          >
            <option value="">All</option>
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Color
          </span>
          <select
            aria-label="Filter by color"
            className={selectClass}
            value={color}
            onChange={(e) => update('color', e.target.value)}
          >
            <option value="">All</option>
            {colors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="ml-auto flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Sort
          </span>
          <select
            aria-label="Sort by"
            className={selectClass}
            value={sort}
            onChange={(e) => update('sort', e.target.value)}
          >
            {sortOptions.map((s) => (
              <option key={s} value={s}>
                {sortLabels[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Active filter chips */}
      {hasActive && (
        <div className="flex flex-wrap items-center gap-3">
          {size && (
            <FilterChip label={`Size: ${size}`} onClear={() => update('size', '')} />
          )}
          {color && (
            <FilterChip
              label={`Color: ${color}`}
              onClear={() => update('color', '')}
            />
          )}
          {sort && sort !== 'newest' && (
            <FilterChip
              label={sortLabels[sort as keyof typeof sortLabels]}
              onClear={() => update('sort', '')}
            />
          )}
          <button
            type="button"
            onClick={clearAll}
            className="text-[11px] uppercase tracking-[0.2em] text-accent underline underline-offset-4 hover:text-foreground"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 border border-primary/20 px-4 py-1.5 text-[11px] uppercase tracking-[0.12em] text-foreground">
      {label}
      <button
        type="button"
        onClick={onClear}
        aria-label={`Remove ${label}`}
        className="text-muted-foreground hover:text-accent"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}
