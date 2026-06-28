import { CategoriesClient } from '@/components/admin/categories-client';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const navItems = await prisma.navItem.findMany({
    orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }],
  });

  return <CategoriesClient navItems={navItems} />;
}
