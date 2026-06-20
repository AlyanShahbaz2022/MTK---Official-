import { getCurrentUser } from '@/lib/session';
import { getCartCount } from '@/server/cart';
import { HeaderShell, type NavLink } from '@/components/layout/header-shell';

const navLinks: NavLink[] = [
  { label: 'Men', href: '/men' },
  { label: 'Women', href: '/women' },
  { label: 'Kids', href: '/kids' },
  { label: 'Shop', href: '/shop' },
];

/** Server header — fetches session + cart count, renders the interactive shell. */
export async function SiteHeader() {
  const user = await getCurrentUser();
  const cartCount = user ? await getCartCount(user.id) : 0;

  return (
    <HeaderShell
      navLinks={navLinks}
      isAuthenticated={!!user}
      cartCount={cartCount}
    />
  );
}
