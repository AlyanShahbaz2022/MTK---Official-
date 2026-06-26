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
      </Reveal>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {panels.map((p, i) => (
          <Reveal key={p.label} delay={i * 0.1}>
            <Link
              href={p.href}
              className="group relative block aspect-[4/5] overflow-hidden bg-primary md:aspect-[3/4]"
            >
              <Image
                src={p.image}
                alt={p.label}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-[1.2s] ease-luxe group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 md:p-10">
                <h3 className="font-display text-3xl font-medium uppercase tracking-wide text-white drop-shadow md:text-4xl">
                  {p.label}
                </h3>
                <span className="mt-3 inline-block text-[11px] font-medium uppercase tracking-[0.25em] text-white underline decoration-1 underline-offset-8 transition-colors duration-fast group-hover:text-accent">
                  Shop Now
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
