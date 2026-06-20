'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface GalleryImage {
  url: string;
  alt: string;
}

/** Product gallery — large image with cursor-follow zoom + thumbnail rail. */
export function ProductGallery({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const frameRef = useRef<HTMLDivElement>(null);
  const current = images[active];

  function onMove(e: React.MouseEvent) {
    const el = frameRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  return (
    <div className="flex flex-col-reverse gap-5 lg:flex-row">
      {/* Thumbnail rail */}
      {images.length > 1 && (
        <div className="flex gap-4 lg:flex-col">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                'relative aspect-[3/4] w-16 shrink-0 overflow-hidden transition-opacity duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-20',
                i === active
                  ? 'ring-1 ring-accent'
                  : 'opacity-60 hover:opacity-100',
              )}
            >
              <Image src={img.url} alt={img.alt} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div
        id="pdp-main-image"
        ref={frameRef}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
        className="relative aspect-[3/4] flex-1 overflow-hidden bg-muted"
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
      </div>
    </div>
  );
}
