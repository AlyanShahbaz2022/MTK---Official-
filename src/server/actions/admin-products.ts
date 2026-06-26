'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { productSchema } from '@/schemas/admin';
import { isCloudinaryConfigured, uploadImage, deleteImage } from '@/lib/cloudinary';

export type ActionResult = { ok: boolean; error?: string; id?: string };

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  let slug = base || 'product';
  let n = 1;
  // Append -2, -3… until unique.
  while (true) {
    const clash = await prisma.product.findFirst({
      where: { slug, ...(ignoreId ? { NOT: { id: ignoreId } } : {}) },
      select: { id: true },
    });
    if (!clash) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

/** Read + validate the product fields from FormData. */
function parseForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug') || undefined,
    description: formData.get('description'),
    price: formData.get('price'),
    categoryId: formData.get('categoryId'),
    gender: formData.get('gender'),
    isActive: formData.get('isActive') === 'true',
    isFeatured: formData.get('isFeatured') === 'true',
  });
}

/** Optional image upload from a FormData file field. */
async function maybeUploadImage(
  formData: FormData,
): Promise<{ url: string; publicId: string } | null | { error: string }> {
  const file = formData.get('image');
  if (!(file instanceof File) || file.size === 0) return null;
  if (!isCloudinaryConfigured) return { error: 'Image uploads are not configured.' };
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { error: 'Image must be JPG, PNG, or WEBP.' };
  }
  if (file.size > MAX_IMAGE_BYTES) return { error: 'Image is too large (max 5 MB).' };
  const buffer = Buffer.from(await file.arrayBuffer());
  return uploadImage(buffer, 'products');
}

export async function createProduct(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }
  const d = parsed.data;

  const upload = await maybeUploadImage(formData);
  if (upload && 'error' in upload) return { ok: false, error: upload.error };

  const slug = await uniqueSlug(slugify(d.slug || d.name));
  // SKU base from the slug, kept unique-ish; collisions are astronomically unlikely.
  const skuBase = slug.toUpperCase().replace(/-/g, '').slice(0, 8) || 'PROD';

  const product = await prisma.product.create({
    data: {
      name: d.name,
      slug,
      description: d.description || `${d.name} — part of the MTK collection.`,
      basePrice: d.price * 100,
      gender: d.gender,
      categoryId: d.categoryId,
      isActive: d.isActive,
      isFeatured: d.isFeatured,
      images: upload
        ? { create: [{ url: upload.url, alt: d.name, position: 0, publicId: upload.publicId }] }
        : undefined,
      // Default buyable variant so the product can be added to cart immediately.
      variants: {
        create: [
          {
            size: 'One Size',
            color: 'Default',
            sku: `${skuBase}-${Date.now().toString(36).toUpperCase()}`,
            stock: 25,
          },
        ],
      },
    },
    select: { id: true },
  });

  await logAudit({
    action: 'ADMIN_ACTION',
    userId: admin.id,
    email: admin.email ?? undefined,
    meta: { type: 'product_create', name: d.name },
  });

  revalidatePath('/admin/products');
  revalidatePath('/admin');
  return { ok: true, id: product.id };
}

export async function updateProduct(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }
  const d = parsed.data;

  const existing = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { position: 'asc' } } },
  });
  if (!existing) return { ok: false, error: 'Product not found.' };

  const upload = await maybeUploadImage(formData);
  if (upload && 'error' in upload) return { ok: false, error: upload.error };

  const slug = await uniqueSlug(slugify(d.slug || d.name), id);

  await prisma.product.update({
    where: { id },
    data: {
      name: d.name,
      slug,
      description: d.description || existing.description,
      basePrice: d.price * 100,
      gender: d.gender,
      categoryId: d.categoryId,
      isActive: d.isActive,
      isFeatured: d.isFeatured,
    },
  });

  // Replace the primary image if a new one was uploaded.
  if (upload && !('error' in upload)) {
    const old = existing.images[0];
    if (old) {
      await prisma.productImage.update({
        where: { id: old.id },
        data: { url: upload.url, alt: d.name, publicId: upload.publicId },
      });
      if (old.publicId) await deleteImage(old.publicId);
    } else {
      await prisma.productImage.create({
        data: { productId: id, url: upload.url, alt: d.name, position: 0, publicId: upload.publicId },
      });
    }
  }

  await logAudit({
    action: 'ADMIN_ACTION',
    userId: admin.id,
    email: admin.email ?? undefined,
    meta: { type: 'product_update', id },
  });

  revalidatePath('/admin/products');
  revalidatePath('/admin');
  return { ok: true, id };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, variants: { select: { id: true } } },
  });
  if (!product) return { ok: false, error: 'Product not found.' };

  // Block deletion if the product was ever ordered (preserve order history).
  // OrderItem has no variant relation, so match on the snapshotted variantIds/slug.
  const variantIds = product.variants.map((v) => v.id);
  const orderedCount = await prisma.orderItem.count({
    where: {
      OR: [
        { variantId: { in: variantIds } },
        { productSlug: product.slug },
      ],
    },
  });
  if (orderedCount > 0) {
    return {
      ok: false,
      error: 'This product appears in past orders. Set it to inactive instead of deleting.',
    };
  }

  await prisma.product.delete({ where: { id } });
  // Best-effort cleanup of Cloudinary assets.
  for (const img of product.images) {
    if (img.publicId) await deleteImage(img.publicId);
  }

  await logAudit({
    action: 'ADMIN_ACTION',
    userId: admin.id,
    email: admin.email ?? undefined,
    meta: { type: 'product_delete', id },
  });

  revalidatePath('/admin/products');
  revalidatePath('/admin');
  return { ok: true };
}
