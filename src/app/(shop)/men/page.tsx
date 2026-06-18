import type { Metadata } from 'next';
import { ProductListing } from '@/components/product/product-listing';

export const metadata: Metadata = { title: 'Men' };

export default async function MenPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <ProductListing
      title="Men"
      gender="MEN"
      basePath="/men"
      rawSearchParams={await searchParams}
    />
  );
}
