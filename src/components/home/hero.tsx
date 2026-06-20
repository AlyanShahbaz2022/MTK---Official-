'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Cinematic hero banner — the centerpiece of the site.
 * Parallax background + slow Ken Burns zoom, staggered text entrance,
 * legibility overlay, scroll cue. Falls back to an elegant dark panel
 * if the image fails to load. Honors prefers-reduced-motion.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // Background drifts down slower than scroll; content drifts up; overlay deepens.
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);
  const overlay = useTransform(scrollYProgress, [0, 1], [0.45, 0.75]);

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
  };
  const item = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: EASE },
    },
  };

  return (
    <section
      ref={ref}
      className="relative h-[92vh] min-h-[560px] w-full overflow-hidden bg-primary text-light-gray"
    >
      {/* Parallax background image with slow zoom */}
      <motion.div className="absolute inset-0" style={{ y: reduce ? 0 : bgY }}>
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.12 }}
          animate={reduce ? { scale: 1.12 } : { scale: 1 }}
          transition={{ duration: 2.4, ease: EASE }}
        >
          <Image
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000"
            alt="MTK seasonal collection"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
      </motion.div>

      {/* Legibility overlay (deepens on scroll) */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40"
        style={{ opacity: overlay }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 mx-auto flex h-full max-w-screen-2xl flex-col justify-end px-6 pb-24 md:px-10 md:pb-28"
        style={{ y: reduce ? 0 : contentY }}
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.span
          variants={item}
          className="text-[11px] font-medium uppercase tracking-[0.4em] text-accent"
        >
          New Season — 2026
        </motion.span>

        <motion.h1
          variants={item}
          className="mt-6 max-w-4xl font-display text-5xl font-medium leading-[1.05] tracking-tight text-light-gray sm:text-6xl md:text-7xl lg:text-8xl"
        >
          Timeless pieces,
          <br />
          <span className="italic text-light-gray/95">effortlessly worn.</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-7 max-w-md text-base leading-relaxed text-light-gray/80 md:text-lg"
        >
          A considered wardrobe for Men, Women &amp; Kids — crafted from refined
          materials, designed to last beyond the season.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/shop"
            className={buttonVariants({
              size: 'lg',
              className:
                'bg-light-gray text-primary hover:bg-light-gray/90 border border-light-gray',
            })}
          >
            Shop the collection
          </Link>
          <Link
            href="/women"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'lg' }),
              'border-light-gray/50 text-light-gray hover:bg-light-gray hover:text-primary',
            )}
          >
            Women
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-light-gray/60">
          Scroll
        </span>
        <motion.span
          className="block h-10 w-px bg-light-gray/40"
          animate={reduce ? {} : { scaleY: [0.3, 1, 0.3], originY: 0 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  );
}
