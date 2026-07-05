import Link from 'next/link';

/** Luxury 404 error page matching MTK design tokens. */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      {/* 404 header */}
      <h1 className="font-serif text-7xl font-extralight text-accent tracking-[0.1em] sm:text-8xl">
        404
      </h1>
      
      {/* Sub-heading */}
      <h2 className="mt-4 font-serif text-lg uppercase tracking-[0.25em] text-foreground sm:text-xl">
        Page Not Found
      </h2>
      
      {/* Explanation */}
      <p className="mt-3 max-w-md text-[13px] leading-relaxed text-muted-foreground/80 font-sans">
        The collection, product, or page you are looking for does not exist or has been moved.
      </p>
      
      {/* Action CTA */}
      <Link
        href="/"
        className="mt-8 inline-flex h-[44px] items-center justify-center border border-primary bg-primary px-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-all hover:bg-transparent hover:text-primary"
      >
        Return Home
      </Link>
    </div>
  );
}
