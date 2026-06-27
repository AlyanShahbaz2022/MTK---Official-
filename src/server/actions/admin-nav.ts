'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { NAV_CACHE_TAG } from '@/server/nav';

export type NavActionResult = { ok: boolean; error?: string };

/**
 * Toggle a single NavItem on or off.
 * When a TOP-LEVEL item is disabled, its children are implicitly hidden
 * because getNavItems() only returns children of enabled top-level items.
 */
export async function toggleNavItem(
  key: string,
  enabled: boolean,
): Promise<NavActionResult> {
  await requireAdmin();

  const item = await prisma.navItem.findUnique({ where: { key } });
  if (!item) return { ok: false, error: 'Nav item not found.' };

  await prisma.navItem.update({
    where: { key },
    data: { isEnabled: enabled },
  });

  // Bust the nav cache so the storefront picks up the change immediately.
  revalidateTag(NAV_CACHE_TAG);
  revalidatePath('/', 'layout');

  return { ok: true };
}

/**
 * Fetch all nav items for the admin UI (all levels, enabled or not).
 */
export async function getAllNavItemsForAdmin() {
  await requireAdmin();
  return prisma.navItem.findMany({
    orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }],
  });
}
