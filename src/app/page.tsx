'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const categories = ['Men', 'Women', 'Kids'] as const;

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="relative flex flex-1 flex-col items-center justify-center bg-surface-base px-8 py-8 text-center text-text-tertiary">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-md uppercase tracking-[0.4em] text-text-tertiary/70"
        >
          edenrobe-inspired
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="mt-6 text-[clamp(2.5rem,8vw,6rem)] font-semibold uppercase leading-none tracking-tight"
        >
          MTK
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="mt-6 max-w-md text-base text-text-tertiary/80"
        >
          Modern clothing for Men, Women &amp; Kids. A production-grade
          storefront — coming together, phase by phase.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
          className="mt-8 flex gap-6"
        >
          <Button variant="primary" size="lg" className="bg-text-tertiary text-surface-base hover:bg-text-tertiary/90">
            Shop Now
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-text-tertiary text-text-tertiary hover:bg-text-tertiary hover:text-surface-base"
          >
            Explore
          </Button>
        </motion.div>
      </section>

      {/* Category strip */}
      <section className="grid grid-cols-1 sm:grid-cols-3">
        {categories.map((c, i) => (
          <motion.a
            key={c}
            href="#"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.2 + i * 0.05 }}
            className="group flex h-48 items-center justify-center border border-muted bg-background text-4xl font-semibold uppercase tracking-widest text-text-primary transition-colors duration-instant hover:bg-surface-base hover:text-text-tertiary focus-visible:bg-surface-base focus-visible:text-text-tertiary"
          >
            {c}
          </motion.a>
        ))}
      </section>

      {/* Footer */}
      <footer className="bg-surface-strong px-8 py-8 text-center text-md uppercase tracking-widest text-text-tertiary/60">
        MTK © {new Date().getFullYear()} — Phase 0 foundation
      </footer>
    </main>
  );
}
