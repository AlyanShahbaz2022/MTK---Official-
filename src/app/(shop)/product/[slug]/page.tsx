import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { ProductGallery } from '@/components/product/product-gallery';
import { VariantSelector } from '@/components/product/variant-selector';
import { ProductAccordion } from '@/components/product/product-accordion';
import { ProductReviews } from '@/components/product/product-reviews';
import { RelatedProducts } from '@/components/product/related-products';
import { getProductBySlug, getProducts } from '@/server/products';
import { parseProductFilters } from '@/schemas/catalog';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product?.name ?? 'Product',
    description: product?.description?.slice(0, 150),
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  // Related: same gender, excluding this product (composed from existing query).
  const { products: sameGender } = await getProducts(
    parseProductFilters({}),
    product.gender,
  );
  const related = sameGender.filter((p) => p.slug !== product.slug).slice(0, 4);

  const genderPath = `/${product.gender.toLowerCase()}`;

  return (
    <main>
      <div className="mx-auto max-w-screen-2xl px-6 py-8 md:px-10 md:py-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <Link href={genderPath} className="hover:text-foreground">
            {product.gender}
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground">{product.category.name}</span>
        </nav>

        {/* Gallery + info */}
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} />

          <div className="lg:sticky lg:top-24 lg:h-fit">
            <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
              {product.category.name}
            </span>
            <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
              {product.name}
            </h1>

            <div className="mt-8">
              <VariantSelector
                variants={product.variants}
                basePrice={product.basePrice}
                product={{
                  name: product.name,
                  slug: product.slug,
                  image: product.images[0]?.url,
                }}
              />
            </div>

            {/* Details accordion */}
            <div className="mt-10">
              <ProductAccordion
                sections={[
                  {
                    title: 'Description',
                    content: <p>{product.description}</p>,
                  },
                  {
                    title: 'Fabric & Care',
                    content: (
                      <ul className="list-inside list-disc space-y-1.5">
                        <li>Premium, breathable fabric</li>
                        <li>Gentle machine or hand wash, cold</li>
                        <li>Do not bleach; warm iron if needed</li>
                        <li>Dry in shade to preserve color</li>
                      </ul>
                    ),
                  },
                  {
                    id: 'size-guide',
                    title: 'Size Guide',
                    content: (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                          <thead>
                            <tr className="border-b border-primary/15 text-foreground">
                              <th className="py-2 pr-4 font-medium">Size</th>
                              <th className="py-2 pr-4 font-medium">Chest (in)</th>
                              <th className="py-2 font-medium">Length (in)</th>
                            </tr>
                          </thead>
                          <tbody className="text-muted-foreground">
                            {[
                              ['S', '36–38', '38'],
                              ['M', '38–40', '39'],
                              ['L', '40–42', '40'],
                              ['XL', '42–44', '41'],
                            ].map((r) => (
                              <tr key={r[0]} className="border-b border-primary/10">
                                <td className="py-2 pr-4">{r[0]}</td>
                                <td className="py-2 pr-4">{r[1]}</td>
                                <td className="py-2">{r[2]}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ),
                  },
                  {
                    title: 'Shipping & Returns',
                    content: (
                      <ul className="list-inside list-disc space-y-1.5">
                        <li>Complimentary shipping on orders over Rs 10,000</li>
                        <li>Standard delivery in 3–5 business days</li>
                        <li>30-day returns &amp; exchanges on unworn items</li>
                      </ul>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      <ProductReviews
        ratingAvg={product.ratingAvg}
        ratingCount={product.ratingCount}
      />

      <RelatedProducts products={related} />
    </main>
  );
}
