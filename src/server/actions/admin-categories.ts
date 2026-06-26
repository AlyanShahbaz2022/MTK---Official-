'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { categorySchema } from '@/schemas/admin';

export type ActionResult = { ok: boolean; error?: string };

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function createCategory(input: {
  name: string;
  gender: string;
}): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const slug = slugify(parsed.data.name);
  const exists = await prisma.category.findUnique({ where: { slug } });
  if (exists) return { ok: false, error: 'A category with this name already exists.' };

  await prisma.category.create({
    data: { name: parsed.data.name, slug, gender: parsed.data.gender },
  });

  await logAudit({
    action: 'ADMIN_ACTION',
    userId: admin.id,
    email: admin.email ?? undefined,
    meta: { type: 'category_create', name: parsed.data.name },
  });

  revalidatePath('/admin/categories');
  return { ok: true };
}

export async function updateCategory(
  id: string,
  input: { name: string; gender: string },
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const slug = slugify(parsed.data.name);
  const clash = await prisma.category.findFirst({
    where: { slug, NOT: { id } },
  });
  if (clash) return { ok: false, error: 'Another category already uses this name.' };

  await prisma.category.update({
    where: { id },
    data: { name: parsed.data.name, slug, gender: parsed.data.gender },
  });

  await logAudit({
    action: 'ADMIN_ACTION',
    userId: admin.id,
    email: admin.email ?? undefined,
    meta: { type: 'category_update', id },
  });

  revalidatePath('/admin/categories');
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();

  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return {
      ok: false,
      error: `Move or delete its ${count} product(s) first.`,
    };
  }

  await prisma.category.delete({ where: { id } });

  await logAudit({
    action: 'ADMIN_ACTION',
    userId: admin.id,
    email: admin.email ?? undefined,
    meta: { type: 'category_delete', id },
  });

  revalidatePath('/admin/categories');
  return { ok: true };
}
