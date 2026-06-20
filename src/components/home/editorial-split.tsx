import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { buttonVariants } from '@/components/ui/button';

/** Image + text editorial block (alternating storytelling section). */
export function EditorialSplit() {
  return (
    <section className="mx-auto grid max-w-screen-2xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2 md:px-10 md:py-28">
      <Reveal direction="right">
        <div className="relative aspect-[4/5] overflow-hidden bg-primary">
          <Image
            src="/images/editorial.jpg"
            alt="Crafted to last — Pakistani festive suits"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </Reveal>

      <Reveal direction="left" className="md:pl-8">
        <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent">
          The Craft
        </span>
        <h2 className="mt-5 font-display text-4xl font-medium leading-tight tracking-tight text-foreground md:text-5xl">
          Made with intention, worn for years
        </h2>
        <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
          Every MTK piece begins with the material. We work with mills that share
          our standards, then cut and finish each garment to fall beautifully and
          endure. The result is a wardrobe you reach for again and again.
        </p>
        <Link
          href="/shop"
          className={buttonVariants({ variant: 'outline', className: 'mt-9' })}
        >
          Explore the collection
        </Link>
      </Reveal>
    </section>
  );
}
