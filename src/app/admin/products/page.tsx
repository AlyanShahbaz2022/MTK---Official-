import { getAdminProducts, getAdminCategories } from '@/server/admin/data';
import {
  ProductsClient,
  type AdminProductRow,
  type CategoryOption,
  type DepartmentOption,
} from '@/components/admin/products-client';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const [products, categories, deptNavItems] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
    prisma.navItem.findMany({ where: { level: 0 }, orderBy: { sortOrder: 'asc' } }),
  ]);

  const rows: AdminProductRow[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    image: p.images[0]?.url ?? null,
    categoryId: p.category.id,
    categoryName: p.category.name,
    gender: p.gender,
    price: p.basePrice,
    stock: p.variants.reduce((n, v) => n + v.stock, 0),
    variantCount: p.variants.length,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
  }));

  const categoryOptions: CategoryOption[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  // Map NavItem department label → Gender enum value
  const labelToGender = (label: string): string => {
    const l = label.toLowerCase();
    if (l.includes('women') || l.includes('girl')) return 'WOMEN';
    if (l.includes('kid') || l.includes('child') || l.includes('boy')) return 'KIDS';
    return 'MEN';
  };

  const departments: DepartmentOption[] = deptNavItems.map((d) => ({
    label: d.label,
    value: labelToGender(d.label),
  }));

  return (
    <ProductsClient
      products={rows}
      categories={categoryOptions}
      departments={departments}
    />
  );
}
