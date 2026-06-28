'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { NAV_CACHE_TAG } from '@/server/nav';

export type NavActionResult = { ok: boolean; error?: string };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function uniqueKey(base: string): Promise<string> {
  const exists = await prisma.navItem.findUnique({ where: { key: base } });
  if (!exists) return base;
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

function bust() {
  revalidateTag(NAV_CACHE_TAG);
  revalidatePath('/', 'layout');
  revalidatePath('/admin/categories');
}

/**
 * Map a department label to the Gender enum value.
 * Falls back to MEN if unknown.
 */
function labelToGender(label: string): 'MEN' | 'WOMEN' | 'KIDS' {
  const l = label.toLowerCase();
  if (l.includes('women') || l.includes('girl')) return 'WOMEN';
  if (l.includes('kid') || l.includes('child') || l.includes('boy')) return 'KIDS';
  return 'MEN';
}

/**
 * Auto-sync: when a level=1 (category) NavItem is created/updated,
 * keep a matching Category record in sync so products can still be assigned.
 * The Category slug === navItem.key so they're linked without a foreign key.
 */
async function syncCategoryFromNavItem(
  navKey: string,
  label: string,
  parentKey: string | null,
) {
  let gender: 'MEN' | 'WOMEN' | 'KIDS' = 'MEN';
  if (parentKey) {
    const dept = await prisma.navItem.findUnique({ where: { key: parentKey } });
    if (dept) gender = labelToGender(dept.label);
  }
  await prisma.category.upsert({
    where: { slug: navKey },
    update: { name: label, gender },
    create: { name: label, slug: navKey, gender },
  });
}

/**
 * Auto-sync: when a level=1 NavItem is deleted, remove the matching Category
 * only if it has no products (preserve data integrity).
 */
async function deleteCategoryIfEmpty(navKey: string) {
  const cat = await prisma.category.findUnique({ where: { slug: navKey } });
  if (!cat) return;
  const productCount = await prisma.product.count({ where: { categoryId: cat.id } });
  if (productCount === 0) {
    await prisma.category.delete({ where: { id: cat.id } });
  }
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getAllNavItemsForAdmin() {
  await requireAdmin();
  return prisma.navItem.findMany({
    orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }],
  });
}

// ---------------------------------------------------------------------------
// Toggle
// ---------------------------------------------------------------------------

export async function toggleNavItem(key: string, enabled: boolean): Promise<NavActionResult> {
  await requireAdmin();
  const item = await prisma.navItem.findUnique({ where: { key } });
  if (!item) return { ok: false, error: 'Nav item not found.' };
  await prisma.navItem.update({ where: { key }, data: { isEnabled: enabled } });
  bust();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export interface CreateNavItemInput {
  label: string;
  href: string;
  parentKey?: string | null;
  level: 0 | 1 | 2;
}

export async function createNavItem(input: CreateNavItemInput): Promise<NavActionResult> {
  await requireAdmin();

  const { label, href, parentKey, level } = input;
  if (!label.trim()) return { ok: false, error: 'Label is required.' };
  const finalHref = href.trim() || `/${slugify(label)}`;

  if (level > 0 && parentKey) {
    const parent = await prisma.navItem.findUnique({ where: { key: parentKey } });
    if (!parent) return { ok: false, error: 'Parent item not found.' };
    if (parent.level !== level - 1) return { ok: false, error: 'Parent level mismatch.' };
  }

  const siblings = await prisma.navItem.findMany({
    where: { parentKey: parentKey ?? null, level },
    orderBy: { sortOrder: 'asc' },
  });
  const sortOrder = siblings.length > 0 ? (siblings[siblings.length - 1]!.sortOrder + 1) : 0;

  const fragment = slugify(label);
  const baseKey = parentKey ? `${parentKey}-${fragment}` : fragment;
  const key = await uniqueKey(baseKey);

  await prisma.navItem.create({
    data: { key, label: label.trim(), href: finalHref, parentKey: parentKey ?? null, level, sortOrder, isEnabled: true },
  });

  // Auto-sync: level=1 = category → create matching Category record
  if (level === 1) {
    await syncCategoryFromNavItem(key, label.trim(), parentKey ?? null);
  }

  bust();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export interface UpdateNavItemInput {
  label?: string;
  href?: string;
}

export async function updateNavItem(key: string, input: UpdateNavItemInput): Promise<NavActionResult> {
  await requireAdmin();

  if (!input.label?.trim() && !input.href?.trim())
    return { ok: false, error: 'Nothing to update.' };

  const item = await prisma.navItem.findUnique({ where: { key } });
  if (!item) return { ok: false, error: 'Nav item not found.' };

  await prisma.navItem.update({
    where: { key },
    data: {
      ...(input.label?.trim() ? { label: input.label.trim() } : {}),
      ...(input.href?.trim() ? { href: input.href.trim() } : {}),
    },
  });

  // Auto-sync: if this is a level=1 item, update its Category record
  if (item.level === 1 && input.label?.trim()) {
    await syncCategoryFromNavItem(key, input.label.trim(), item.parentKey);
  }

  bust();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Delete (cascade — deletes all descendants too)
// ---------------------------------------------------------------------------

async function collectDescendantKeys(key: string): Promise<string[]> {
  const children = await prisma.navItem.findMany({ where: { parentKey: key } });
  const keys: string[] = [key];
  for (const child of children) {
    keys.push(...(await collectDescendantKeys(child.key)));
  }
  return keys;
}

export async function deleteNavItem(key: string): Promise<NavActionResult> {
  await requireAdmin();

  const item = await prisma.navItem.findUnique({ where: { key } });
  if (!item) return { ok: false, error: 'Nav item not found.' };

  const keys = await collectDescendantKeys(key);

  // Collect all level=1 keys in the subtree before deleting (for Category cleanup)
  const allItems = await prisma.navItem.findMany({ where: { key: { in: keys } } });
  const categoryKeys = allItems.filter(i => i.level === 1).map(i => i.key);

  await prisma.navItem.deleteMany({ where: { key: { in: keys } } });

  // Auto-sync: clean up matching Category records if they have no products
  for (const catKey of categoryKeys) {
    await deleteCategoryIfEmpty(catKey);
  }

  bust();
  return { ok: true };
}
