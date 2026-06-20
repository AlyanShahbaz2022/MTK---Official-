import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  page: number;
  pageCount: number;
  /** Existing query params to preserve (without `page`). */
  searchParams: Record<string, string | undefined>;
  basePath: string;
}

export function Pagination({ page, pageCount, searchParams, basePath }: Props) {
  if (pageCount <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v && k !== 'page') params.set(k, v);
    }
    params.set('page', String(p));
    return `${basePath}?${params.toString()}`;
  };

  const cell =
    'flex h-11 min-w-11 items-center justify-center px-4 text-xs font-medium uppercase tracking-[0.12em] transition-colors duration-fast ease-luxe focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <nav
      className="mt-16 flex items-center justify-center gap-2"
      aria-label="Pagination"
    >
      {page > 1 && (
        <Link
          href={href(page - 1)}
          aria-label="Previous page"
          className={cn(cell, 'text-foreground hover:text-accent')}
        >
          <ChevronLeft className="size-4" />
        </Link>
      )}

      {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? 'page' : undefined}
          className={cn(
            cell,
            'border-b',
            p === page
              ? 'border-accent text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          {p}
        </Link>
      ))}

      {page < pageCount && (
        <Link
          href={href(page + 1)}
          aria-label="Next page"
          className={cn(cell, 'text-foreground hover:text-accent')}
        >
          <ChevronRight className="size-4" />
        </Link>
      )}
    </nav>
  );
}
