import type { Config } from 'tailwindcss';

/**
 * MTK design system — edenrobe-style tokens.
 * Source of truth: DESIGN ethenrob.md / SKILLS ethenrob.md.
 * Colors are exposed as CSS variables (see globals.css) so components use
 * semantic tokens, never raw hex (per design-system rules).
 */
const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Semantic tokens -> CSS variables
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
        // shadcn/ui semantic aliases
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        ring: 'var(--ring)',
      },
      fontFamily: {
        // Montserrat is the brand font (loaded via next/font in layout.tsx)
        sans: ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
      },
      fontSize: {
        // edenrobe typography scale
        xs: '9px',
        sm: '10px',
        md: '11px',
        lg: '12px',
        xl: '13px',
        '2xl': '14px',
        '3xl': '15px',
        '4xl': '16px',
        base: ['17px', { lineHeight: '24.48px', fontWeight: '400' }],
      },
      spacing: {
        // edenrobe tight spacing scale (space.1–8)
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
        xs: '4px',
        sm: '5px',
        md: '6px',
        lg: '50px',
        xl: '62px',
      },
      transitionDuration: {
        instant: '200ms',
        fast: '250ms',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
