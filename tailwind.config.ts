import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

/**
 * MTK design system — LUXURY edition.
 * Premium / elegant / timeless. Colors are exposed as CSS variables
 * (see globals.css) so components use semantic tokens, never raw hex,
 * and dark mode works by swapping variable values.
 *
 * Note: the small fontSize/spacing keys from the previous system are kept
 * for backward compatibility with not-yet-redesigned pages; new luxury
 * components use the standard Tailwind scale (text-5xl+, gap-10+, etc.).
 */
const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // --- New luxury tokens ---
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        'dark-gray': 'var(--color-dark-gray)',
        'light-gray': 'var(--color-light-gray)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        ring: 'var(--ring)',

        // --- Backward-compatible aliases (existing pages) ---
        text: {
          primary: 'var(--color-text-primary)',
          tertiary: 'var(--color-text-tertiary)',
        },
        surface: {
          base: 'var(--color-surface-base)',
          strong: 'var(--color-surface-strong)',
        },
        border: {
          muted: 'var(--color-border-muted)',
        },
      },
      fontFamily: {
        // Inter = body/UI, Playfair Display = headings (loaded in layout.tsx)
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      letterSpacing: {
        luxe: '0.2em',
      },
      fontSize: {
        // Legacy small keys (kept so existing pages still resolve).
        xs: '9px',
        sm: '10px',
        md: '11px',
        lg: '12px',
        xl: '13px',
        '2xl': '14px',
        '3xl': '15px',
        '4xl': '16px',
        // text-5xl..9xl fall through to Tailwind defaults (normal large sizes).
        base: ['17px', { lineHeight: '24.48px', fontWeight: '400' }],
      },
      spacing: {
        // Legacy tight scale (kept for existing pages); 9+ use Tailwind defaults.
        1: '3px',
        2: '4px',
        3: '5px',
        4: '6px',
        5: '7px',
        6: '8px',
        7: '10px',
        8: '12px',
      },
      borderRadius: {
        none: '0px',
        xs: '2px',
        sm: '4px',
        md: '6px',
        lg: '50px',
        xl: '62px',
      },
      transitionDuration: {
        instant: '200ms',
        fast: '250ms',
        slow: '500ms',
        slower: '700ms',
      },
      transitionTimingFunction: {
        // Refined easing for luxury motion.
        luxe: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.7s ease both',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
