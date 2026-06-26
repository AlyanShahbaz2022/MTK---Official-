import { getAdminProducts, getAdminCategories } from '@/server/admin/data';
import {
  ProductsClient,
  type AdminProductRow,
  type CategoryOption,
} from '@/components/admin/products-client';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
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

  return <ProductsClient products={rows} categories={categoryOptions} />;
}
