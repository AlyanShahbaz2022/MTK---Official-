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
      </Reveal>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {columns.map((c, i) => (
          <Reveal key={c.label} delay={i * 0.1}>
            <Link
              href={c.href}
              className="group relative block aspect-[3/4] overflow-hidden bg-primary"
            >
              <Image
                src={c.image}
                alt={c.label}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-[1.2s] ease-luxe group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <h3 className="font-display text-2xl font-medium uppercase tracking-wide text-white drop-shadow md:text-3xl">
                  {c.label}
                </h3>
                <span className="mt-3 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.25em] text-white/90 transition-colors duration-fast group-hover:text-accent">
                  Shop Now
                  <span className="h-px w-8 bg-current transition-all duration-fast group-hover:w-12" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
