import 'server-only';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { NavLink, NavGroup, NavItem as NavItemType } from '@/components/layout/header-shell';

export const NAV_CACHE_TAG = 'nav-items';

/**
 * Fetch the full nav tree from DB and assemble it into the NavLink[]
 * structure expected by HeaderShell.
 *
 * Cached for 60 s; invalidated by revalidateTag(NAV_CACHE_TAG) on any admin toggle.
 * Disabling a top-level item hides it AND all its children automatically.
 */
export const getNavItems = unstable_cache(
  async (): Promise<NavLink[]> => {
    const all = await prisma.navItem.findMany({
      orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }],
    });

    // Build lookup maps keyed by `key`.
    const byKey = new Map(all.map((n) => [n.key, n]));

    // Top-level items (level 0).
    const topLevel = all.filter((n) => n.level === 0 && n.isEnabled);

    const result: NavLink[] = topLevel.map((top) => {
      // Groups (level 1) whose parent is this top-level item.
      const groups = all.filter(
        (n) => n.level === 1 && n.parentKey === top.key && n.isEnabled,
      );

      if (groups.length === 0) {
        // Simple link — no dropdown.
        return { label: top.label, href: top.href };
      }

      const navGroups: NavGroup[] = groups.map((group) => {
        // Sub-items (level 2) whose parent is this group.
        const items: NavItemType[] = all
          .filter((n) => n.level === 2 && n.parentKey === group.key && n.isEnabled)
          .map((n) => ({ label: n.label, href: n.href }));

        return {
          heading: group.label,
          href: group.href,
          items,
        };
      });

      return {
        label: top.label,
        href: top.href,
        groups: navGroups,
      };
    });

    return result;
  },
  ['nav-items'],
  { tags: [NAV_CACHE_TAG], revalidate: 60 },
);
