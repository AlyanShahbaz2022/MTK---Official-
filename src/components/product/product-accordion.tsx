'use client';

import { useState, type ReactNode } from 'react';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Section {
  id?: string;
  title: string;
  content: ReactNode;
}

/** Accordion for product details. First section open by default. */
export function ProductAccordion({ sections }: { sections: Section[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-primary/10 border-y border-primary/10">
      {sections.map((s, i) => {
        const isOpen = open === i;
        return (
          <div key={s.title} id={s.id}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between py-6 text-left focus-visible:outline-none"
            >
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-foreground">
                {s.title}
              </span>
              {isOpen ? (
                <Minus className="size-4 text-accent" />
              ) : (
                <Plus className="size-4 text-muted-foreground" />
              )}
            </button>
            <div
              className={cn(
                'grid transition-all duration-slow ease-luxe',
                isOpen
                  ? 'grid-rows-[1fr] pb-7 opacity-100'
                  : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden text-sm leading-relaxed text-muted-foreground">
                {s.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
