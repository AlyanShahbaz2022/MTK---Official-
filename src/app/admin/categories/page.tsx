import { getAdminCategories } from '@/server/admin/data';
import { CategoriesClient, type AdminCategoryRow } from '@/components/admin/categories-client';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await getAdminCategories();

  const rows: AdminCategoryRow[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    gender: c.gender,
    products: c._count.products,
  }));

  return <CategoriesClient categories={rows} />;
}
