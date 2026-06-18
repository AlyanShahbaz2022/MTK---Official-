import type { Metadata } from 'next';
import { ProductListing } from '@/components/product/product-listing';

export const metadata: Metadata = { title: 'Women' };

export default async function WomenPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <ProductListing
      title="Women"
      gender="WOMEN"
      basePath="/women"
      rawSearchParams={await searchParams}
    />
  );
}
