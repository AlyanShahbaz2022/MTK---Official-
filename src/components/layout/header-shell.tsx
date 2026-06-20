'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, User, Heart, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CartBadge } from '@/components/cart/cart-badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export interface NavLink {
  label: string;
  href: string;
}

interface Props {
  navLinks: NavLink[];
  isAuthenticated: boolean;
  cartCount: number;
}

/** Interactive luxury navbar: shrinks on scroll, mobile drawer, theme toggle. */
export function HeaderShell({ navLinks, isAuthenticated, cartCount }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the drawer on route change.
  useEffect(() => setMenuOpen(false), [pathname]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const linkClass =
    'relative text-xs font-medium uppercase tracking-[0.2em] text-foreground/80 transition-colors duration-fast ease-luxe hover:text-foreground after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-accent after:transition-all after:duration-fast hover:after:w-full';

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-slow ease-luxe',
        scrolled
          ? 'border-b border-primary/10 bg-background/85 backdrop-blur-md'
          : 'border-b border-transparent bg-background',
      )}
    >
      <div
        className={cn(
          'mx-auto grid max-w-screen-2xl grid-cols-[1fr_auto_1fr] items-center px-6 transition-all duration-slow ease-luxe md:px-10',
          scrolled ? 'h-16' : 'h-20',
        )}
      >
        {/* Left: desktop nav / mobile menu button */}
        <div className="flex items-center">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="p-2 md:hidden"
          >
            <Menu className="size-5" />
          </button>
          <nav className="hidden items-center gap-9 md:flex">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className={linkClass}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center: logo */}
        <Link
          href="/"
          className="select-none text-center font-display text-2xl font-semibold tracking-[0.3em] text-foreground"
        >
          MTK
        </Link>

        {/* Right: actions */}
        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <Link
            href="/search"
            aria-label="Search"
            className="p-2 text-foreground transition-colors duration-fast hover:text-accent"
          >
            <Search className="size-5" />
          </Link>
          <ThemeToggle />
          <Link
            href={isAuthenticated ? '/account' : '/login'}
            aria-label={isAuthenticated ? 'Account' : 'Sign in'}
            className="hidden p-2 text-foreground transition-colors duration-fast hover:text-accent sm:inline-flex"
          >
            <User className="size-5" />
          </Link>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="hidden p-2 text-foreground transition-colors duration-fast hover:text-accent sm:inline-flex"
          >
            <Heart className="size-5" />
          </Link>
          <CartBadge isAuthenticated={isAuthenticated} dbCount={cartCount} />
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-primary/40 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-[82%] max-w-sm flex-col bg-background px-8 py-7 md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-10 flex items-center justify-between">
                <span className="font-display text-xl font-semibold tracking-[0.3em]">
                  MTK
                </span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                  className="p-2"
                >
                  <X className="size-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-6">
                {navLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="font-display text-2xl tracking-wide text-foreground"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-5 border-t border-primary/10 pt-7 text-xs uppercase tracking-[0.2em]">
                <Link href={isAuthenticated ? '/account' : '/login'}>
                  {isAuthenticated ? 'My Account' : 'Sign in'}
                </Link>
                <Link href="/wishlist">Wishlist</Link>
                <Link href="/cart">Cart</Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
