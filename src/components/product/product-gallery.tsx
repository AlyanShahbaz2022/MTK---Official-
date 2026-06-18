'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface GalleryImage {
  url: string;
  alt: string;
}

export function ProductGallery({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div className="space-y-5">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {current ? (
          <Image
            src={current.url}
            alt={current.alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-md uppercase tracking-widest text-muted-foreground">
            No image
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-4">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                'relative aspect-square w-20 overflow-hidden border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                i === active ? 'border-text-primary' : 'border-transparent',
              )}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
