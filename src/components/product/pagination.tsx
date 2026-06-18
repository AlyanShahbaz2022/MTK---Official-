import Link from 'next/link';
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

  return (
    <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? 'page' : undefined}
          className={cn(
            'flex h-10 min-w-10 items-center justify-center rounded-xs border px-5 text-lg transition-colors duration-instant',
            p === page
              ? 'border-text-primary bg-text-primary text-text-tertiary'
              : 'border-text-primary/20 text-text-primary hover:border-text-primary',
          )}
        >
          {p}
        </Link>
      ))}
    </nav>
  );
}
