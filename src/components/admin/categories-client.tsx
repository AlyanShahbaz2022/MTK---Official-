'use client';

import { NavBuilderClient, type NavRow } from '@/components/admin/nav-builder-client';
import { PageHeader } from '@/components/admin/ui';

export function CategoriesClient({ navItems }: { navItems: NavRow[] }) {
  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Add departments, categories and sub-categories — products sync automatically"
      />
      <NavBuilderClient initialItems={navItems} />
    </>
  );
}
