'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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

/**
 * Luxury navbar.
 * - On the homepage it overlays the hero: transparent with white text at the
 *   top, transitioning to a solid white (shadowed) bar with dark text on scroll.
 * - On every other page it's a normal solid sticky bar.
 */
export function HeaderShell({ navLinks, isAuthenticated, cartCount }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  const overlay = pathname === '/'; // homepage has the full-screen hero
  const onDark = overlay && !scrolled; // light text over the hero

  function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const linkClass = cn(
    'relative text-[15px] font-medium uppercase tracking-[0.12em] transition-colors duration-fast ease-luxe after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-accent after:transition-all after:duration-fast hover:after:w-full',
    onDark ? 'text-white/90 hover:text-white' : 'text-foreground/90 hover:text-foreground',
  );

  const iconLink = cn(
    'p-2.5 transition-colors duration-fast',
    onDark ? 'text-white hover:text-white/75' : 'text-foreground hover:text-accent',
  );

  return (
    <header
      className={cn(
        'top-0 z-50 transition-all duration-slow ease-luxe',
        overlay ? 'fixed inset-x-0' : 'sticky',
        onDark
          ? 'border-b border-transparent bg-transparent'
          : 'border-b border-primary/10 bg-background/95 shadow-md backdrop-blur-md',
      )}
    >
      <div
        className={cn(
          'mx-auto grid max-w-screen-2xl grid-cols-[auto_1fr_auto] items-center px-6 transition-all duration-slow ease-luxe md:px-10',
          scrolled ? 'h-16' : 'h-20',
        )}
      >
        {/* Left: mobile menu button + logo */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className={cn('-ml-2 p-2 md:hidden', onDark ? 'text-white' : 'text-foreground')}
          >
            <Menu size={28} />
          </button>
          <Link
            href="/"
            className={cn(
              'select-none font-display text-3xl font-semibold tracking-[0.3em] transition-colors duration-fast',
              onDark ? 'text-white' : 'text-foreground',
            )}
          >
            MTK
          </Link>
        </div>

        {/* Center: nav menu */}
        <nav className="hidden items-center justify-center gap-10 md:flex">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right: actions */}
        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <Link href="/search" aria-label="Search" className={cn(iconLink, 'md:hidden')}>
            <Search size={40} />
          </Link>

          {/* Search bar (desktop) */}
          <form
            onSubmit={onSearch}
            role="search"
            className={cn(
              'mr-2 hidden items-center gap-3 border-b-2 px-2 py-3 transition-colors duration-fast md:flex',
              onDark
                ? 'border-white/50 focus-within:border-white'
                : 'border-primary/25 focus-within:border-accent',
            )}
          >
            <Search
              size={28}
              className={cn('shrink-0', onDark ? 'text-white/70' : 'text-muted-foreground')}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              aria-label="Search products"
              className={cn(
                'w-48 bg-transparent text-xl focus:outline-none lg:w-72',
                onDark
                  ? 'text-white placeholder:text-white/60'
                  : 'text-foreground placeholder:text-muted-foreground',
              )}
            />
          </form>

          <ThemeToggle light={onDark} />
          <Link
            href={isAuthenticated ? '/account' : '/login'}
            aria-label={isAuthenticated ? 'Account' : 'Sign in'}
            className={cn(iconLink, 'hidden sm:inline-flex')}
          >
            <User size={40} />
          </Link>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className={cn(iconLink, 'hidden sm:inline-flex')}
          >
            <Heart size={40} />
          </Link>
          <CartBadge isAuthenticated={isAuthenticated} dbCount={cartCount} light={onDark} />
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
                <span className="font-display text-xl font-semibold tracking-[0.3em] text-foreground">
                  MTK
                </span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                  className="p-2 text-foreground"
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

              <div className="mt-auto flex flex-col gap-5 border-t border-primary/10 pt-7 text-xs uppercase tracking-[0.2em] text-foreground">
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
