import { getAdminCategories } from '@/server/admin/data';
import { AddProductForm, type CategoryOption } from '@/components/admin/add-product-form';

export const dynamic = 'force-dynamic';

export default async function AddProductPage() {
  const categories = await getAdminCategories();

  const categoryOptions: CategoryOption[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    gender: c.gender,
    subCategories: c.subCategories.map((s) => ({
      id: s.id,
      name: s.name,
    })),
  }));

  return <AddProductForm categories={categoryOptions} />;
}
