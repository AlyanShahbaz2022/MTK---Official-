'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { productSchema } from '@/schemas/admin';
import { isCloudinaryConfigured, uploadImage, deleteImage } from '@/lib/cloudinary';
import { CATALOG_TAG } from '@/server/products';

/**
 * Invalidate every cache that reflects the catalog after a product change:
 * the cached filter options/categories (tag) and the public storefront pages.
 */
function revalidateCatalog() {
  revalidateTag(CATALOG_TAG);
  revalidatePath('/admin/products');
  revalidatePath('/admin');
  revalidatePath('/shop');
  revalidatePath('/women');
  revalidatePath('/men');
  revalidatePath('/kids');
}

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
    subCategoryId: formData.get('subCategoryId') || null,
    fabric: formData.get('fabric') || null,
    careInstructions: formData.get('careInstructions') || null,
    season: formData.get('season') || null,
    gender: formData.get('gender'),
    isActive: formData.get('isActive') === 'true',
    isFeatured: formData.get('isFeatured') === 'true',

    // Advanced fields
    sku: formData.get('sku') || null,
    salePrice: formData.get('salePrice') || null,
    costPrice: formData.get('costPrice') || null,
    stockQuantity: formData.get('stockQuantity') || 0,
    minStockAlert: formData.get('minStockAlert') || 0,
    brand: formData.get('brand') || null,
    productType: formData.get('productType') || null,
    collection: formData.get('collection') || null,
    material: formData.get('material') || null,
    color: formData.get('color') || null,
    secondaryColor: formData.get('secondaryColor') || null,
    sizeType: formData.get('sizeType') || null,
    availableSizes: formData.get('availableSizes') || null,
    fit: formData.get('fit') || null,
    pattern: formData.get('pattern') || null,
    sleeveType: formData.get('sleeveType') || null,
    neckType: formData.get('neckType') || null,
    occasion: formData.get('occasion') || null,
    shortDescription: formData.get('shortDescription') || null,
    fullDescription: formData.get('fullDescription') || null,
    videoUrl: formData.get('videoUrl') || null,
    seoTitle: formData.get('seoTitle') || null,
    metaDescription: formData.get('metaDescription') || null,
    keywords: formData.get('keywords') || null,
    canonicalUrl: formData.get('canonicalUrl') || null,
    ogImage: formData.get('ogImage') || null,
    weight: formData.get('weight') || null,
    shippingLength: formData.get('shippingLength') || null,
    shippingWidth: formData.get('shippingWidth') || null,
    shippingHeight: formData.get('shippingHeight') || null,
    shippingClass: formData.get('shippingClass') || null,
    isNewArrival: formData.get('isNewArrival') === 'true',
    isBestSeller: formData.get('isBestSeller') === 'true',
    isOnSale: formData.get('isOnSale') === 'true',
    isDraft: formData.get('isDraft') === 'true',
  });
}

/** Optional multiple image upload from a FormData file field. */
async function maybeUploadImages(
  formData: FormData,
): Promise<{ url: string; publicId: string }[] | { error: string }> {
  const files = formData.getAll('image');
  const uploads: { url: string; publicId: string }[] = [];

  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue;
    if (!isCloudinaryConfigured) return { error: 'Image uploads are not configured.' };
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { error: `Image "${file.name}" must be JPG, PNG, or WEBP.` };
    }
    if (file.size > MAX_IMAGE_BYTES) return { error: `Image "${file.name}" is too large (max 5 MB).` };
    const buffer = Buffer.from(await file.arrayBuffer());
    const res = await uploadImage(buffer, 'products');
    if (res && 'error' in res) return { error: String(res.error) };
    if (res) uploads.push(res);
  }
  return uploads;
}

interface FormVariantInput {
  size: string;
  color: string;
  stock: number;
  sku?: string;
}

export async function createProduct(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }
  const d = parsed.data;

  const uploads = await maybeUploadImages(formData);
  if (uploads && 'error' in uploads) return { ok: false, error: uploads.error };

  const slug = await uniqueSlug(slugify(d.slug || d.name));
  const skuBase = slug.toUpperCase().replace(/-/g, '').slice(0, 8) || 'PROD';

  // Parse variants JSON list
  const variantsJson = formData.get('variants');
  let variantsInput: FormVariantInput[] = [];
  if (variantsJson && typeof variantsJson === 'string') {
    try {
      variantsInput = JSON.parse(variantsJson);
    } catch {
      return { ok: false, error: 'Invalid variants format.' };
    }
  }

  // Fallback variant if none provided
  if (variantsInput.length === 0) {
    variantsInput = [{
      size: 'One Size',
      color: 'Default',
      stock: 25,
      sku: `${skuBase}-${Date.now().toString(36).toUpperCase()}`
    }];
  } else {
    variantsInput = variantsInput.map((v, i) => ({
      ...v,
      sku: v.sku?.trim() || `${skuBase}-${v.color.toUpperCase().replace(/\s+/g, '')}-${v.size.toUpperCase().replace(/\s+/g, '')}-${Date.now().toString(36).toUpperCase()}-${i}`
    }));
  }

  const product = await prisma.product.create({
    data: {
      name: d.name,
      slug,
      description: d.description || d.shortDescription || `${d.name} — part of the MTK collection.`,
      basePrice: d.price * 100,
      gender: d.gender,
      categoryId: d.categoryId,
      subCategoryId: d.subCategoryId,
      fabric: d.fabric || null,
      careInstructions: d.careInstructions || null,
      season: d.season || null,
      isActive: d.isDraft ? false : d.isActive,
      isFeatured: d.isFeatured,

      // Advanced fields
      sku: d.sku || null,
      salePrice: d.salePrice ? d.salePrice * 100 : null,
      costPrice: d.costPrice ? d.costPrice * 100 : null,
      stockQuantity: d.stockQuantity,
      minStockAlert: d.minStockAlert,
      brand: d.brand || null,
      productType: d.productType || null,
      collection: d.collection || null,
      material: d.material || null,
      color: d.color || null,
      secondaryColor: d.secondaryColor || null,
      sizeType: d.sizeType || null,
      availableSizes: d.availableSizes || null,
      fit: d.fit || null,
      pattern: d.pattern || null,
      sleeveType: d.sleeveType || null,
      neckType: d.neckType || null,
      occasion: d.occasion || null,
      shortDescription: d.shortDescription || null,
      fullDescription: d.fullDescription || null,
      videoUrl: d.videoUrl || null,
      seoTitle: d.seoTitle || null,
      metaDescription: d.metaDescription || null,
      keywords: d.keywords || null,
      canonicalUrl: d.canonicalUrl || null,
      ogImage: d.ogImage || null,
      weight: d.weight || null,
      shippingLength: d.shippingLength || null,
      shippingWidth: d.shippingWidth || null,
      shippingHeight: d.shippingHeight || null,
      shippingClass: d.shippingClass || null,
      isNewArrival: d.isNewArrival,
      isBestSeller: d.isBestSeller,
      isOnSale: d.isOnSale,
      isDraft: d.isDraft,

      images: uploads.length > 0
        ? {
            create: uploads.map((upload, idx) => ({
              url: upload.url,
              alt: d.name,
              position: idx,
              publicId: upload.publicId,
            })),
          }
        : undefined,
      variants: {
        create: variantsInput.map((v) => ({
          size: v.size,
          color: v.color,
          sku: v.sku!,
          stock: v.stock,
        })),
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

  revalidateCatalog();
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

  // 1. Delete requested images
  const deletedImageIdsStr = formData.get('deletedImageIds');
  if (deletedImageIdsStr && typeof deletedImageIdsStr === 'string') {
    const deletedImageIds = deletedImageIdsStr.split(',').filter(Boolean);
    if (deletedImageIds.length > 0) {
      const toDeleteImages = await prisma.productImage.findMany({
        where: { id: { in: deletedImageIds } },
      });
      for (const img of toDeleteImages) {
        if (img.publicId) await deleteImage(img.publicId);
      }
      await prisma.productImage.deleteMany({
        where: { id: { in: deletedImageIds } },
      });
    }
  }

  // 2. Upload new images and append them
  const uploads = await maybeUploadImages(formData);
  if (uploads && 'error' in uploads) return { ok: false, error: uploads.error };

  const slug = await uniqueSlug(slugify(d.slug || d.name), id);

  await prisma.product.update({
    where: { id },
    data: {
      name: d.name,
      slug,
      description: d.description || d.shortDescription || existing.description,
      basePrice: d.price * 100,
      gender: d.gender,
      categoryId: d.categoryId,
      subCategoryId: d.subCategoryId,
      fabric: d.fabric || null,
      careInstructions: d.careInstructions || null,
      season: d.season || null,
      isActive: d.isDraft ? false : d.isActive,
      isFeatured: d.isFeatured,

      // Advanced fields
      sku: d.sku || null,
      salePrice: d.salePrice ? d.salePrice * 100 : null,
      costPrice: d.costPrice ? d.costPrice * 100 : null,
      stockQuantity: d.stockQuantity,
      minStockAlert: d.minStockAlert,
      brand: d.brand || null,
      productType: d.productType || null,
      collection: d.collection || null,
      material: d.material || null,
      color: d.color || null,
      secondaryColor: d.secondaryColor || null,
      sizeType: d.sizeType || null,
      availableSizes: d.availableSizes || null,
      fit: d.fit || null,
      pattern: d.pattern || null,
      sleeveType: d.sleeveType || null,
      neckType: d.neckType || null,
      occasion: d.occasion || null,
      shortDescription: d.shortDescription || null,
      fullDescription: d.fullDescription || null,
      videoUrl: d.videoUrl || null,
      seoTitle: d.seoTitle || null,
      metaDescription: d.metaDescription || null,
      keywords: d.keywords || null,
      canonicalUrl: d.canonicalUrl || null,
      ogImage: d.ogImage || null,
      weight: d.weight || null,
      shippingLength: d.shippingLength || null,
      shippingWidth: d.shippingWidth || null,
      shippingHeight: d.shippingHeight || null,
      shippingClass: d.shippingClass || null,
      isNewArrival: d.isNewArrival,
      isBestSeller: d.isBestSeller,
      isOnSale: d.isOnSale,
      isDraft: d.isDraft,
    },
  });

  // Keep all existing image alt texts in sync with name
  await prisma.productImage.updateMany({
    where: { productId: id },
    data: { alt: d.name },
  });

  // Append new uploads
  if (uploads.length > 0) {
    const remainingImages = await prisma.productImage.findMany({
      where: { productId: id },
      orderBy: { position: 'desc' },
      take: 1,
    });
    const startPos = remainingImages.length > 0 ? remainingImages[0]!.position + 1 : 0;
    
    await prisma.productImage.createMany({
      data: uploads.map((upload, idx) => ({
        productId: id,
        url: upload.url,
        alt: d.name,
        position: startPos + idx,
        publicId: upload.publicId,
      })),
    });
  }

  // 3. Synchronize variants
  const variantsJson = formData.get('variants');
  if (variantsJson && typeof variantsJson === 'string') {
    let incomingVariants: FormVariantInput[] = [];
    try {
      incomingVariants = JSON.parse(variantsJson);
    } catch {
      return { ok: false, error: 'Invalid variants format.' };
    }

    const currentVariants = await prisma.productVariant.findMany({
      where: { productId: id },
    });

    const currentMap = new Map(currentVariants.map((v) => [`${v.size}-${v.color}`, v]));
    const incomingKeys = new Set(incomingVariants.map((v) => `${v.size}-${v.color}`));

    // Delete variants no longer in the list
    const toDeleteIds = currentVariants
      .filter((v) => !incomingKeys.has(`${v.size}-${v.color}`))
      .map((v) => v.id);
    if (toDeleteIds.length > 0) {
      await prisma.productVariant.deleteMany({
        where: { id: { in: toDeleteIds } },
      });
    }

    // Create or update incoming variants
    for (const incoming of incomingVariants) {
      const key = `${incoming.size}-${incoming.color}`;
      const existingVariant = currentMap.get(key);
      const sku = incoming.sku?.trim() || existingVariant?.sku || `${slug.toUpperCase().replace(/-/g, '')}-${incoming.color.toUpperCase().replace(/\s+/g, '')}-${incoming.size.toUpperCase().replace(/\s+/g, '')}-${Date.now().toString(36).toUpperCase()}`;

      if (existingVariant) {
        await prisma.productVariant.update({
          where: { id: existingVariant.id },
          data: { stock: incoming.stock, sku },
        });
      } else {
        await prisma.productVariant.create({
          data: {
            productId: id,
            size: incoming.size,
            color: incoming.color,
            stock: incoming.stock,
            sku,
          },
        });
      }
    }
  }

  await logAudit({
    action: 'ADMIN_ACTION',
    userId: admin.id,
    email: admin.email ?? undefined,
    meta: { type: 'product_update', id },
  });

  revalidateCatalog();
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

  revalidateCatalog();
  return { ok: true };
}

export async function deleteProductsBulk(
  ids: string[],
): Promise<{ ok: boolean; deleted: number; skipped: number; error?: string }> {
  const admin = await requireAdmin();
  if (!ids.length) return { ok: false, deleted: 0, skipped: 0, error: 'No products selected.' };

  let deleted = 0;
  let skipped = 0;

  for (const id of ids) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: { select: { id: true } } },
    });
    if (!product) continue;

    const variantIds = product.variants.map((v) => v.id);
    const orderedCount = await prisma.orderItem.count({
      where: { OR: [{ variantId: { in: variantIds } }, { productSlug: product.slug }] },
    });

    if (orderedCount > 0) { skipped++; continue; }

    await prisma.product.delete({ where: { id } });
    for (const img of product.images) {
      if (img.publicId) await deleteImage(img.publicId);
    }
    deleted++;
  }

  await logAudit({
    action: 'ADMIN_ACTION',
    userId: admin.id,
    email: admin.email ?? undefined,
    meta: { type: 'product_bulk_delete', ids, deleted, skipped },
  });

  revalidateCatalog();
  return { ok: true, deleted, skipped };
}
