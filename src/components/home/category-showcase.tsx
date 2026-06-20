import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';

const categories = [
  {
    label: 'Women',
    href: '/women',
    image:
      'https://images.pexels.com/photos/20777170/pexels-photo-20777170.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    label: 'Men',
    href: '/men',
    image:
      'https://images.pexels.com/photos/8692253/pexels-photo-8692253.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    label: 'Kids',
    href: '/kids',
    image:
      'https://images.pexels.com/photos/17043208/pexels-photo-17043208.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
];

export function CategoryShowcase() {
  return (
    <section className="mx-auto max-w-screen-2xl px-6 py-20 md:px-10 md:py-28">
      <Reveal className="mb-12 text-center">
        <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent">
          Collections
        </span>
        <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
          Shop by category
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {categories.map((c, i) => (
          <Reveal key={c.href} delay={i * 0.1}>
            <Link
              href={c.href}
              className="group relative block aspect-[3/4] overflow-hidden bg-primary"
            >
              <Image
                src={c.image}
                alt={c.label}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover opacity-90 transition-transform duration-[1.2s] ease-luxe group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-10 text-center">
                <h3 className="font-display text-3xl font-medium tracking-wide text-light-gray">
                  {c.label}
                </h3>
                <span className="mt-3 text-[11px] uppercase tracking-[0.25em] text-light-gray/80 transition-colors duration-fast group-hover:text-accent">
                  Discover
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
