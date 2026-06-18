import Link from 'next/link';
import { Search, User, ShoppingBag } from 'lucide-react';
import { getCurrentUser } from '@/lib/session';

const navLinks = [
  { label: 'Men', href: '/men' },
  { label: 'Women', href: '/women' },
  { label: 'Kids', href: '/kids' },
  { label: 'Shop All', href: '/shop' },
];

/** Top site header — nav, search, account, cart. Server component. */
export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-text-primary/10 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-8">
        <Link
          href="/"
          className="text-[1.5rem] font-semibold uppercase tracking-tight text-text-primary"
        >
          MTK
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xl font-medium uppercase tracking-wide text-text-primary transition-colors duration-instant hover:text-muted-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-7">
          <Link href="/search" aria-label="Search" className="p-2">
            <Search className="size-5" />
          </Link>
          <Link
            href={user ? '/account' : '/login'}
            aria-label={user ? 'Account' : 'Sign in'}
            className="p-2"
          >
            <User className="size-5" />
          </Link>
          <Link href="/cart" aria-label="Cart" className="p-2">
            <ShoppingBag className="size-5" />
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="flex items-center justify-center gap-7 border-t border-text-primary/10 py-4 md:hidden">
        {navLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-lg font-medium uppercase tracking-wide text-text-primary"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
