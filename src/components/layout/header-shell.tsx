'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, User, Heart, Menu, ChevronDown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CartBadge } from '@/components/cart/cart-badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { MobileDrawer } from '@/components/layout/mobile-drawer';

export interface NavItem {
  label: string;
  href: string;
}

export interface NavGroup {
  heading: string;
  href: string;
  items: NavItem[];
}

export interface NavLink {
  label: string;
  href: string;
  /** Grouped mega-menu columns */
  groups?: NavGroup[];
  /** Legacy flat children (kept for compatibility) */
  children?: NavItem[];
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
  const [hovered, setHovered] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const overlay = pathname === '/';
  const onDark = overlay && !scrolled;

  function doSearch() {
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
    setSearchOpen(false);
  }

  function onSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    doSearch();
  }

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => { setHovered(null); }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      // iOS-safe scroll lock: position:fixed remembers scroll, overflow:hidden alone doesn't work on Safari.
      const scrollY = window.scrollY;
      document.body.dataset.scrollY = String(scrollY);
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = parseInt(document.body.dataset.scrollY ?? '0', 10);
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    }
    return () => {
      const scrollY = parseInt(document.body.dataset.scrollY ?? '0', 10);
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (menuOpen) window.scrollTo(0, scrollY);
    };
  }, [menuOpen]);

  const linkClass = cn(
    'relative text-[13px] font-semibold uppercase tracking-[0.14em] transition-colors duration-fast ease-luxe after:absolute after:-bottom-1.5 after:left-0 after:h-[1.5px] after:w-0 after:bg-accent after:transition-all after:duration-fast hover:after:w-full',
    onDark ? 'text-white/90 hover:text-white' : 'text-foreground/90 hover:text-foreground',
  );

  const iconLink = cn(
    'p-2 transition-colors duration-fast',
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
          'mx-auto grid max-w-screen-2xl grid-cols-[auto_1fr_auto] items-center px-4 transition-all duration-slow ease-luxe sm:px-6 md:px-10',
          scrolled ? 'h-16' : 'h-16 sm:h-20',
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
              'select-none font-display text-2xl font-semibold tracking-[0.2em] transition-colors duration-fast xs:text-3xl xs:tracking-[0.3em]',
              onDark ? 'text-white' : 'text-foreground',
            )}
          >
            MTK
          </Link>
        </div>

        {/* Center: nav menu */}
        <nav
          className="hidden items-center justify-center gap-10 md:flex"
          onMouseLeave={() => setHovered(null)}
        >
          {navLinks.map((l) => {
            const hasGroups = !!l.groups?.length;
            const hasChildren = !!l.children?.length;
            const hasMega = hasGroups || hasChildren;

            return (
              <div
                key={l.href}
                className="relative"
                onMouseEnter={() => setHovered(l.label)}
              >
                <Link href={l.href} className={cn(linkClass, 'inline-flex items-center gap-1')}>
                  {l.label}
                  {hasMega && (
                    <ChevronDown
                      className={cn(
                        'size-3 transition-transform duration-200',
                        hovered === l.label ? 'rotate-180' : '',
                      )}
                    />
                  )}
                </Link>

                {hasMega && (
                  <AnimatePresence>
                    {hovered === l.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-4"
                      >
                        {/* Mega-menu panel */}
                        {hasGroups ? (
                          <MegaMenu link={l} onClose={() => setHovered(null)} />
                        ) : (
                          <FlatMenu link={l} onClose={() => setHovered(null)} />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right: actions */}
        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <form onSubmit={onSearchSubmit} role="search" className="flex items-center">
            <AnimatePresence initial={false}>
              {searchOpen && (
                <motion.div
                  key="search-field"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'var(--search-w)', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden [--search-w:120px] xs:[--search-w:160px] sm:[--search-w:200px]"
                >
                  <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
                    onBlur={() => !query && setSearchOpen(false)}
                    placeholder="Search"
                    aria-label="Search products"
                    className={cn(
                      'w-full border-b bg-transparent pb-1.5 text-sm focus:outline-none',
                      onDark
                        ? 'border-white/50 text-white placeholder:text-white/60'
                        : 'border-primary/30 text-foreground placeholder:text-muted-foreground',
                    )}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <button
              type="button"
              aria-label={searchOpen ? 'Submit search' : 'Open search'}
              onClick={() => {
                if (!searchOpen) setSearchOpen(true);
                else if (query.trim()) doSearch();
                else setSearchOpen(false);
              }}
              className={iconLink}
            >
              <Search size={22} />
            </button>
          </form>

          <ThemeToggle light={onDark} />
          <Link
            href={isAuthenticated ? '/account' : '/login'}
            aria-label={isAuthenticated ? 'Account' : 'Sign in'}
            className={cn(iconLink, 'hidden sm:inline-flex')}
          >
            <User size={22} />
          </Link>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className={cn(iconLink, 'hidden sm:inline-flex')}
          >
            <Heart size={22} />
          </Link>
          <CartBadge isAuthenticated={isAuthenticated} dbCount={cartCount} light={onDark} />
        </div>
      </div>

      {/* Mobile drawer */}
      <MobileDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        departments={navLinks.filter((l) => l.groups?.length || l.children?.length)}
        isAuthenticated={isAuthenticated}
      />
    </header>
  );
}

/* ─────────────────────────────────────────────
   Mega-menu — grouped columns
───────────────────────────────────────────── */
function MegaMenu({ link, onClose }: { link: NavLink; onClose: () => void }) {
  const groups = link.groups!;
  // Wider for Men (4 groups), narrower for fewer
  const totalItems = groups.reduce((n, g) => n + g.items.length, 0);
  const wide = totalItems > 10;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-primary/10 bg-background shadow-[0_20px_60px_-10px_rgba(0,0,0,0.18)] ring-1 ring-black/5',
        wide ? 'w-[680px]' : 'w-[420px]',
      )}
    >
      {/* Top accent bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-accent/70 via-accent to-accent/40" />

      <div className="p-6">
        {/* "Shop all" header link */}
        <div className="mb-5 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">
            {link.label}
          </span>
          <Link
            href={link.href}
            onClick={onClose}
            className="group flex items-center gap-1 text-[12px] font-medium uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-accent"
          >
            Shop All
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Divider */}
        <div className="mb-5 h-px bg-primary/8" />

        {/* Columns */}
        <div
          className={cn(
            'grid gap-6',
            groups.length === 1 && 'grid-cols-1',
            groups.length === 2 && 'grid-cols-2',
            groups.length === 3 && 'grid-cols-3',
            groups.length >= 4 && 'grid-cols-4',
          )}
        >
          {groups.map((group) => (
            <div key={group.heading}>
              {/* Group heading */}
              <Link
                href={group.href}
                onClick={onClose}
                className="group mb-3 flex items-center gap-1.5"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground transition-colors group-hover:text-accent">
                  {group.heading}
                </span>
                <span className="h-px flex-1 bg-primary/12" />
              </Link>

              {/* Sub-items */}
              <ul className="space-y-1.5">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="group/item flex items-center gap-2 text-[13px] text-foreground/70 transition-all duration-150 hover:text-foreground"
                    >
                      <span className="inline-block h-[1px] w-3 shrink-0 bg-accent/0 transition-all duration-200 group-hover/item:w-4 group-hover/item:bg-accent" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Flat dropdown — for legacy children[]
───────────────────────────────────────────── */
function FlatMenu({ link, onClose }: { link: NavLink; onClose: () => void }) {
  return (
    <div className="min-w-[220px] overflow-hidden rounded-xl border border-primary/10 bg-background py-3 shadow-xl">
      <div className="h-[2px] w-full bg-gradient-to-r from-accent/60 via-accent to-accent/30" />
      <Link
        href={link.href}
        onClick={onClose}
        className="block px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.15em] text-accent hover:bg-primary/5"
      >
        Shop All {link.label}
      </Link>
      <div className="my-1 h-px bg-primary/8" />
      {link.children!.map((c) => (
        <Link
          key={c.href}
          href={c.href}
          onClick={onClose}
          className="block px-5 py-2.5 text-[14px] tracking-wide text-foreground/80 transition-colors hover:bg-primary/5 hover:text-foreground"
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}
