const PHRASE = 'OF PAKISTAN · MTK · THE FABRIC OF ELEGANCE · TIMELESS · ';

export function Marquee() {
  return (
    <section className="relative overflow-hidden border-y border-primary/10 bg-gradient-to-r from-primary/[0.04] via-background to-primary/[0.04] py-7 md:py-9">
      {/* left + right edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />

      <div className="flex w-max animate-marquee whitespace-nowrap">
        {[0, 1].map((track) => (
          <span
            key={track}
            aria-hidden={track === 1}
            className="font-display text-3xl font-light uppercase tracking-[0.12em] text-accent/70 md:text-5xl"
          >
            {PHRASE.repeat(4)}
          </span>
        ))}
      </div>
    </section>
  );
}
