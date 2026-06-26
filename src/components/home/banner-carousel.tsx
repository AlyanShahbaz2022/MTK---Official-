'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;

interface Slide {
  image: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
}

const slides: Slide[] = [
  {
    image: '/images/hero%20banner.webp',
    eyebrow: 'Save up to 40% — Eid Edit',
    title: 'Festive Lawn 2026',
    subtitle: 'Three-piece unstitched suits — a limited seasonal release.',
    cta: 'Shop the Edit',
    href: '/women',
  },
  {
    image: '/images/hero%20banner%202.webp',
    eyebrow: 'New Arrivals',
    title: 'Luxury Festive',
    subtitle: 'Hand-embroidered formals, crafted for the season.',
    cta: 'Discover',
    href: '/shop',
  },
  {
    image: '/images/hero%20banner%203.webp',
    eyebrow: 'Winter Collection',
    title: 'Embroidered Khaddar',
    subtitle: 'Warm, refined, everyday elegance.',
    cta: 'Explore',
    href: '/women',
  },
  {
    image: '/images/herror%20banner%204.webp',
    eyebrow: 'Signature Edit',
    title: 'Timeless Classics',
    subtitle: 'Elevated essentials for every occasion.',
    cta: 'Shop Now',
    href: '/shop',
  },
  {
    image: '/images/herro%20banner%205.webp',
    eyebrow: 'Limited Release',
    title: 'The Festive Edit',
    subtitle: 'Statement pieces, made to be remembered.',
    cta: 'Discover',
    href: '/women',
  },
];

const AUTOPLAY_MS = 6000;

/**
 * Cinematic promo carousel — the homepage banner.
 * Crossfade slides, slow Ken Burns zoom, autoplay (pauses on hover),
 * prev/next arrows, slide dots. Honors prefers-reduced-motion.
 */
export function BannerCarousel() {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = useCallback((next: number) => {
    setIndex((next + slides.length) % slides.length);
  }, []);

  // Autoplay — advance every 6s.
  useEffect(() => {
    timer.current = setTimeout(() => go(index + 1), AUTOPLAY_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [index, go]);

  const slide = slides[index]!;

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
  };
  const item: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
  };

  return (
    <section
      className="relative h-screen min-h-[600px] w-full overflow-hidden bg-primary text-light-gray"
      aria-roledescription="carousel"
      aria-label="Featured collections"
    >
      {/* Slides (crossfade) */}
      <AnimatePresence>
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: EASE }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: reduce ? 1 : 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: AUTOPLAY_MS / 1000 + 1, ease: 'linear' }}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover object-[center_center]"
            />
          </motion.div>
          {/* Legibility overlay — light, so the imagery stays clear */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/15 to-black/40" />
        </motion.div>
      </AnimatePresence>

      {/* Content — bottom center */}
      <div className="relative z-10 mx-auto flex h-full max-w-screen-2xl flex-col items-center justify-end px-6 pb-28 md:px-10 md:pb-32">
        <motion.div
          key={`content-${index}`}
          className="flex max-w-xl flex-col items-center text-center"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <motion.span
            variants={item}
            className="rounded-sm bg-black/40 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.3em] text-light-gray backdrop-blur-sm"
          >
            {slide.eyebrow}
          </motion.span>
          <motion.h1
            variants={item}
            className="mt-6 font-display text-5xl font-semibold uppercase leading-[1.02] tracking-tight text-light-gray drop-shadow-sm sm:text-6xl md:text-7xl"
          >
            {slide.title}
          </motion.h1>
          <motion.p
            variants={item}
            className="mt-5 max-w-md text-base text-light-gray/85 md:text-lg"
          >
            {slide.subtitle}
          </motion.p>
          <motion.div variants={item} className="mt-8">
            <Link
              href={slide.href}
              className="inline-flex items-center justify-center rounded-full bg-accent px-12 py-4 text-[13px] font-semibold uppercase tracking-[0.18em] text-accent-foreground transition-all duration-fast ease-luxe hover:bg-accent/90"
            >
              {slide.cta}
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Arrows */}
      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => go(index - 1)}
        className="absolute left-4 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-light-gray backdrop-blur-sm transition-colors duration-fast hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-gray md:left-8"
      >
        <ChevronLeft className="size-6" />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => go(index + 1)}
        className="absolute right-4 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-light-gray backdrop-blur-sm transition-colors duration-fast hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-gray md:right-8"
      >
        <ChevronRight className="size-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 gap-3">
        {slides.map((s, i) => (
          <button
            key={s.image}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-fast ease-luxe',
              i === index
                ? 'w-8 bg-accent'
                : 'w-4 bg-light-gray/50 hover:bg-light-gray/80',
            )}
          />
        ))}
      </div>
    </section>
  );
}
