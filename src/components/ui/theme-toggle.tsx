'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Light/dark toggle. `light` renders white icons (for transparent-over-hero navbar). */
export function ThemeToggle({ light = false }: { light?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'p-2.5 transition-colors duration-fast ease-luxe focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        light ? 'text-white hover:text-white/75' : 'text-foreground hover:text-accent',
      )}
    >
      {mounted && isDark ? <Sun size={40} /> : <Moon size={40} />}
    </button>
  );
}
