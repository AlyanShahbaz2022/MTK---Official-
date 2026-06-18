import type { Metadata } from 'next';
import { ProductListing } from '@/components/product/product-listing';

export const metadata: Metadata = { title: 'Shop All' };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <ProductListing
      title="Shop All"
      basePath="/shop"
      rawSearchParams={await searchParams}
    />
  );
}
