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
    <nav className="flex flex-col gap-1">
      {links.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              'flex items-center gap-3 border-l-2 px-5 py-3 text-sm transition-colors duration-fast',
              active
                ? 'border-accent bg-muted/50 font-medium text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <l.icon className="size-[18px]" strokeWidth={1.6} />
            {l.label}
          </Link>
        );
      })}
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex w-full items-center gap-3 border-l-2 border-transparent px-5 py-3 text-sm text-muted-foreground transition-colors duration-fast hover:text-red-600"
        >
          <LogOut className="size-[18px]" strokeWidth={1.6} />
          Sign out
        </button>
      </form>
    </nav>
  );
}
