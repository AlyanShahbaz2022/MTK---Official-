'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { buttonVariants } from '@/components/ui/button';

/** Animated storefront hero. */
export function Hero() {
  return (
    <section className="relative flex min-h-[70vh] flex-col items-center justify-center bg-surface-base px-8 py-8 text-center text-text-tertiary">
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="text-md uppercase tracking-[0.4em] text-text-tertiary/70"
      >
        New Season 2026
      </motion.span>
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="mt-6 max-w-3xl text-[clamp(2.25rem,6vw,4.5rem)] font-semibold uppercase leading-none tracking-tight"
      >
        Clothing crafted for everyday life
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, delay: 0.1 }}
        className="mt-6 max-w-md text-base text-text-tertiary/80"
      >
        Discover the latest collections for Men, Women &amp; Kids.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.15 }}
        className="mt-8"
      >
        <Link
          href="/shop"
          className={buttonVariants({ size: 'lg', className: 'bg-text-tertiary text-surface-base hover:bg-text-tertiary/90' })}
        >
          Shop the collection
        </Link>
      </motion.div>
    </section>
  );
}
