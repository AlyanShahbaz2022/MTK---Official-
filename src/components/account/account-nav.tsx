'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, ShoppingBag, MapPin, UserRound, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logoutAction } from '@/server/actions/auth';

const links = [
  { label: 'Overview', href: '/account', icon: LayoutGrid },
  { label: 'Orders', href: '/account/orders', icon: ShoppingBag },
  { label: 'Addresses', href: '/account/addresses', icon: MapPin },
  { label: 'Profile', href: '/account/profile', icon: UserRound },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    // Mobile: horizontal scroll tab strip (bottom-border active state).
    // lg+: vertical sidebar (left-border active state).
    <nav className="no-scrollbar -mx-4 flex flex-row gap-1 overflow-x-auto border-b border-primary/10 px-4 pb-px sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:overflow-visible lg:border-b-0 lg:px-0 lg:pb-0">
      {links.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              'flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm transition-colors duration-fast lg:gap-3 lg:border-b-0 lg:border-l-2 lg:px-5',
              active
                ? 'border-accent font-medium text-foreground lg:bg-muted/50'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <l.icon className="size-[18px]" strokeWidth={1.6} />
            {l.label}
          </Link>
        );
      })}
      <form action={logoutAction} className="shrink-0 lg:w-full">
        <button
          type="submit"
          className="flex w-full items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-sm text-muted-foreground transition-colors duration-fast hover:text-red-600 lg:gap-3 lg:border-b-0 lg:border-l-2 lg:px-5"
        >
          <LogOut className="size-[18px]" strokeWidth={1.6} />
          Sign out
        </button>
      </form>
    </nav>
  );
}
