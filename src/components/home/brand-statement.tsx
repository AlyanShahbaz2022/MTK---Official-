import { Reveal } from '@/components/motion/reveal';

/** Editorial brand manifesto — quiet, centered, scroll-revealed. */
export function BrandStatement() {
  return (
    <section className="border-y border-primary/10 bg-muted/40">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
        <Reveal>
          <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent">
            Our Philosophy
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-8 font-display text-2xl font-medium leading-relaxed tracking-tight text-foreground md:text-3xl md:leading-relaxed">
            We believe in clothing made to be kept — refined silhouettes, honest
            materials, and a quiet confidence that never chases trends.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mx-auto mt-10 h-px w-16 bg-accent" />
        </Reveal>
      </div>
    </section>
  );
}
