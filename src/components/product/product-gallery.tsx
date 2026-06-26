'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GalleryImage {
  url: string;
  alt: string;
}

/** Product gallery — primary image with cursor-zoom + thumbnail carousel. */
export function ProductGallery({
  images,
  badge,
}: {
  images: GalleryImage[];
  badge?: string;
}) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const frameRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const current = images[active];

  function onMove(e: React.MouseEvent) {
    const el = frameRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setOrigin(
      `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`,
    );
  }

  function scrollRail(dir: -1 | 1) {
    railRef.current?.scrollBy({ left: dir * 200, behavior: 'smooth' });
  }

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div
        id="pdp-main-image"
        ref={frameRef}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
        className="relative aspect-[3/4] overflow-hidden bg-muted"
      >
        {current ? (
          <Image
            src={current.url}
            alt={current.alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            style={{ transformOrigin: origin }}
            className={cn(
              'object-cover transition-transform duration-300 ease-luxe',
              zoom ? 'scale-150' : 'scale-100',
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            No image
          </div>
        )}
        {badge && (
          <span className="absolute left-4 top-4 rounded-sm bg-accent px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
            {badge}
          </span>
        )}
      </div>

      {/* Thumbnail carousel */}
      {images.length > 1 && (
        <div className="relative">
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => scrollRail(-1)}
            className="absolute left-0 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-primary/15 bg-background/90 text-foreground shadow-sm hover:text-accent"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div
            ref={railRef}
            className="flex gap-3 overflow-x-auto scroll-smooth px-11 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((img, i) => (
              <button
                key={img.url + i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
                className={cn(
                  'relative aspect-square w-20 shrink-0 overflow-hidden transition-opacity duration-fast focus-visible:outline-none',
                  i === active ? 'ring-1 ring-accent' : 'opacity-60 hover:opacity-100',
                )}
              >
                <Image src={img.url} alt={img.alt} fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => scrollRail(1)}
            className="absolute right-0 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-primary/15 bg-background/90 text-foreground shadow-sm hover:text-accent"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
