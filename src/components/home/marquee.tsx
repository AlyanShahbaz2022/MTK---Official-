const PHRASE = 'OF PAKISTAN · MTK · THE FABRIC OF ELEGANCE · TIMELESS · ';

export function Marquee() {
  // Two identical tracks side by side; the animation shifts by -50% for a
  // seamless infinite loop.
  return (
    <section className="overflow-hidden border-y border-primary/10 py-8 md:py-10">
      <div className="flex w-max animate-marquee whitespace-nowrap">
        {[0, 1].map((track) => (
          <span
            key={track}
            aria-hidden={track === 1}
            className="font-display text-4xl font-light uppercase tracking-[0.1em] text-accent/80 md:text-6xl"
          >
            {PHRASE.repeat(4)}
          </span>
        ))}
      </div>
    </section>
  );
}
