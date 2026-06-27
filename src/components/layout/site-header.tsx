import { getCurrentUser } from '@/lib/session';
import { getCartCount } from '@/server/cart';
import { getNavItems } from '@/server/nav';
import { HeaderShell } from '@/components/layout/header-shell';

/**
 * Server header — fetches session, cart count, and nav items from DB.
 * Nav items are admin-controlled via /admin/homepage (Navigation Manager).
 */
export async function SiteHeader() {
  const [user, navLinks] = await Promise.all([
    getCurrentUser(),
    getNavItems(),
  ]);
  const cartCount = user ? await getCartCount(user.id) : 0;

  return (
    <HeaderShell
      navLinks={navLinks}
      isAuthenticated={!!user}
      cartCount={cartCount}
    />
  );
}
