import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('flex gap-0.5', className)} aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            'size-4',
            i <= Math.round(value)
              ? 'fill-accent text-accent'
              : 'fill-transparent text-primary/25',
          )}
        />
      ))}
    </div>
  );
}

/** Customer reviews summary. Review submission arrives with the backend (Phase 6). */
export function ProductReviews({
  ratingAvg,
  ratingCount,
}: {
  ratingAvg: number;
  ratingCount: number;
}) {
  return (
    <section className="mx-auto max-w-screen-2xl px-6 py-16 md:px-10">
      <h2 className="mb-10 text-center font-display text-3xl font-medium tracking-tight text-foreground md:text-4xl">
        Customer Reviews
      </h2>

      {ratingCount > 0 ? (
        <div className="flex flex-col items-center gap-4">
          <p className="font-display text-5xl text-foreground">
            {ratingAvg.toFixed(1)}
          </p>
          <Stars value={ratingAvg} />
          <p className="text-sm text-muted-foreground">
            Based on {ratingCount} {ratingCount === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5 py-6 text-center">
          <Stars value={0} />
          <p className="font-display text-2xl tracking-tight text-foreground">
            No reviews yet
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            This piece hasn&apos;t been reviewed yet. Verified buyers can share
            their experience after purchase.
          </p>
        </div>
      )}
    </section>
  );
}
