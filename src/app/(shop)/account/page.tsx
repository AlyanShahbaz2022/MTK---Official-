import Link from 'next/link';
import { ShoppingBag, Heart, MapPin, UserRound } from 'lucide-react';
import { requireUser } from '@/lib/session';

const cards = [
  { label: 'Orders', value: '0', hint: 'View order history', href: '/account/orders', icon: ShoppingBag },
  { label: 'Wishlist', value: '—', hint: 'Saved pieces', href: '/wishlist', icon: Heart },
  { label: 'Addresses', value: '0', hint: 'Manage addresses', href: '/account/addresses', icon: MapPin },
  { label: 'Profile', value: '', hint: 'Account details', href: '/account/profile', icon: UserRound },
];

export default async function AccountOverviewPage() {
  const user = await requireUser();

  return (
    <div className="space-y-10">
      <p className="text-base text-muted-foreground">
        Welcome back. Manage your orders, addresses, and account details below.
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group flex items-center gap-5 border border-primary/10 p-6 transition-colors duration-fast hover:border-primary/30"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-foreground transition-colors group-hover:text-accent">
              <c.icon className="size-5" strokeWidth={1.6} />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {c.label}
              </p>
              {c.value && (
                <p className="font-display text-2xl text-foreground">{c.value}</p>
              )}
              <p className="mt-0.5 text-sm text-muted-foreground">{c.hint}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="border border-primary/10 p-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Signed in as
        </p>
        <p className="mt-2 text-base text-foreground">{user.email}</p>
      </div>
    </div>
  );
}
