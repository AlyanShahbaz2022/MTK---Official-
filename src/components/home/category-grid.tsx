import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';

const columns = [
  { label: 'Unstitched', image: '/images/cat-women.jpg', href: '/women' },
  { label: 'Ready to Wear', image: '/images/editorial.jpg', href: '/shop' },
  { label: 'Freedom to Buy', image: '/images/herror%20banner%204.webp', href: '/men' },
];

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-screen-2xl px-4 py-14 sm:px-6 sm:py-20 md:px-10 md:py-28">
      <Reveal className="mb-8 text-center sm:mb-12">
        <h2 className="font-display text-2xl font-medium uppercase tracking-[0.15em] text-foreground sm:text-3xl md:text-4xl">
          Three Ways to Wear Elegance
        </h2>
        {/* decorative rule */}
        <div className="mx-auto mt-4 h-px w-16 bg-accent/60" />
      </Reveal>

      {/* Mobile/tablet: thumb-swipeable row with snap. Desktop: 3-up grid. */}
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
        {columns.map((c, i) => (
          <Reveal
            key={c.label}
            delay={i * 0.1}
            className="w-[78%] shrink-0 snap-center xs:w-[68%] sm:w-[55%] md:w-auto"
          >
            <Link
              href={c.href}
              className="group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-primary shadow-lg ring-1 ring-black/8 transition-shadow duration-500 hover:shadow-2xl"
            >
              <Image
                src={c.image}
                alt={c.label}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-1200 ease-luxe group-hover:scale-105"
              />
              {/* richer gradient — more readable bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              {/* subtle top vignette */}
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/20 to-transparent" />

              <div className="absolute bottom-0 left-0 p-7">
                <h3 className="font-display text-2xl font-medium uppercase tracking-wide text-white drop-shadow-sm md:text-3xl">
                  {c.label}
                </h3>
                {/* animated underline CTA */}
                <span className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/90 transition-colors duration-300 group-hover:text-accent">
                  Shop Now
                  <span className="h-px w-6 bg-current transition-all duration-300 group-hover:w-10" />
                </span>
              </div>

              {/* corner accent dot */}
              <div className="absolute right-4 top-4 size-2 rounded-full bg-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
