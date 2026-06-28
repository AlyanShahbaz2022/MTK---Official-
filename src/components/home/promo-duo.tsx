import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';

const panels = [
  { label: 'Luxury', image: '/images/women%201.webp', href: '/women' },
  { label: 'Men', image: '/images/Men%201.webp', href: '/men' },
];

export function PromoDuo() {
  return (
    <section className="mx-auto max-w-screen-2xl px-4 py-14 sm:px-6 sm:py-20 md:px-10 md:py-28">
      <Reveal className="mb-8 text-center sm:mb-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent">
          Step Into Fresh Looks
        </p>
        <h2 className="mt-4 font-display text-2xl font-medium uppercase tracking-[0.15em] text-foreground sm:text-3xl md:text-4xl">
          Elegance Redefined for Him &amp; Her
        </h2>
        <div className="mx-auto mt-4 h-px w-16 bg-accent/60" />
      </Reveal>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {panels.map((p, i) => (
          <Reveal key={p.label} delay={i * 0.1}>
            <Link
              href={p.href}
              className="group relative block aspect-[4/5] overflow-hidden rounded-3xl bg-primary shadow-xl ring-1 ring-black/8 transition-shadow duration-500 hover:shadow-2xl md:aspect-[3/4]"
            >
              <Image
                src={p.image}
                alt={p.label}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-[1.2s] ease-luxe group-hover:scale-105"
              />
              {/* layered gradient for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/20 to-transparent" />

              {/* label pill */}
              <div className="absolute left-5 top-5 rounded-full bg-white/15 px-4 py-1.5 backdrop-blur-sm">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                  {i === 0 ? 'Women' : 'Men'}
                </span>
              </div>

              <div className="absolute bottom-0 left-0 p-8 md:p-10">
                <h3 className="font-display text-3xl font-medium uppercase tracking-wide text-white drop-shadow-sm md:text-4xl">
                  {p.label}
                </h3>
                {/* animated CTA */}
                <span className="mt-4 inline-flex items-center gap-3 rounded-full border border-white/40 bg-white/10 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm transition-all duration-300 group-hover:bg-accent group-hover:border-accent group-hover:text-accent-foreground">
                  Shop Now
                  <span className="h-px w-4 bg-current" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
