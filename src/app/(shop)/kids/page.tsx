import type { Metadata } from 'next';
import { ProductListing } from '@/components/product/product-listing';

export const metadata: Metadata = { title: 'Kids' };

export default async function KidsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <ProductListing
      title="Kids"
      gender="KIDS"
      basePath="/kids"
      rawSearchParams={await searchParams}
    />
  );
}
