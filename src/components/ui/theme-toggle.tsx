'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

/** Light/dark toggle. Renders a stable placeholder until mounted (no SSR flash). */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={
        'p-2 text-foreground transition-colors duration-fast ease-luxe hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
        (className ?? '')
      }
    >
      {mounted && isDark ? (
        <Sun className="size-6" />
      ) : (
        <Moon className="size-6" />
      )}
    </button>
  );
}
