import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { buttonVariants } from '@/components/ui/button';

/** Image + text editorial block (alternating storytelling section). */
export function EditorialSplit() {
  return (
    <section className="mx-auto grid max-w-screen-2xl grid-cols-1 items-center gap-8 px-4 pb-14 pt-0 sm:gap-12 sm:px-6 sm:pb-20 md:grid-cols-2 md:px-10 md:pb-28">
      <Reveal direction="right">
        {/* image card with rounded corners + shadow */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-primary shadow-2xl ring-1 ring-black/8">
          <Image
            src="/images/editorial.jpg"
            alt="Crafted to last — Pakistani festive suits"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-[2s] ease-luxe hover:scale-[1.03]"
          />
          {/* subtle inner glow at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/30 to-transparent" />

          {/* floating label badge */}
          <div className="absolute bottom-6 left-6 rounded-2xl bg-black/40 px-5 py-3 backdrop-blur-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-accent">
              MTK Official
            </p>
            <p className="mt-0.5 text-sm font-medium text-white">Festive Collection 2026</p>
          </div>
        </div>
      </Reveal>

      <Reveal direction="left" className="md:pl-8">
        {/* accent rule */}
        <div className="mb-5 h-px w-12 bg-accent" />
        <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent">
          The Craft
        </span>
        <h2 className="mt-5 font-display text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Made with intention,{' '}
          <em className="not-italic text-accent/80">worn for years</em>
        </h2>
        <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
          Every MTK piece begins with the material. We work with mills that share
          our standards, then cut and finish each garment to fall beautifully and
          endure. The result is a wardrobe you reach for again and again.
        </p>

        {/* feature points */}
        <ul className="mt-6 space-y-3">
          {['Premium Pakistani fabric mills', 'Hand-finished embroidery', 'Season-proof construction'].map((f) => (
            <li key={f} className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="size-1.5 shrink-0 rounded-full bg-accent" />
              {f}
            </li>
          ))}
        </ul>

        <Link
          href="/shop"
          className={buttonVariants({ variant: 'outline', className: 'mt-9 rounded-full px-8' })}
        >
          Explore the collection
        </Link>
      </Reveal>
    </section>
  );
}
