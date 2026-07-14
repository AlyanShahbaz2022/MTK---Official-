import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { ProductGallery } from '@/components/product/product-gallery';
import { VariantSelector } from '@/components/product/variant-selector';
import { ProductAccordion } from '@/components/product/product-accordion';
import { ProductReviews } from '@/components/product/product-reviews';
import { RecentlyViewed } from '@/components/product/recently-viewed';
import { YouMayAlsoLike } from '@/components/product/you-may-also-like';
import type { MiniProduct } from '@/components/product/mini-product-card';
import { getProductBySlug, getProducts } from '@/server/products';
import { parseProductFilters } from '@/schemas/catalog';
import { formatPrice } from '@/lib/utils';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product?.seoTitle || product?.name || 'Product',
    description: product?.metaDescription || product?.shortDescription || product?.description?.slice(0, 150),
    keywords: product?.keywords || undefined,
    openGraph: product?.ogImage ? { images: [product.ogImage] } : undefined,
    alternates: product?.canonicalUrl ? { canonical: product.canonicalUrl } : undefined,
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const { products: sameGender } = await getProducts(
    parseProductFilters({}),
    product.gender,
  );
  const related: MiniProduct[] = sameGender
    .filter((p) => p.slug !== product.slug)
    .slice(0, 8)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      price: p.basePrice,
      image: p.images[0]?.url,
    }));

  const fabric = product.fabric || product.material || 'Premium Fabric';
  const genderPath = `/${product.gender.toLowerCase()}`;

  const currentMini: MiniProduct = {
    slug: product.slug,
    name: product.name,
    price: product.basePrice,
    image: product.images[0]?.url,
  };

  // Build a dynamic badge
  const badge = product.isNewArrival ? 'New' : product.isBestSeller ? 'Best Seller' : product.isOnSale ? 'Sale' : undefined;

  // Product detail key-value pairs (only show fields that have values)
  const detailRows: [string, string][] = [];
  if (fabric) detailRows.push(['Fabric', fabric]);
  if (product.material && product.material !== fabric) detailRows.push(['Material', product.material]);
  detailRows.push(['Category', product.category.name]);
  if (product.productType) detailRows.push(['Type', product.productType]);
  if (product.fit) detailRows.push(['Fit', product.fit]);
  if (product.neckType) detailRows.push(['Neck Type', product.neckType]);
  if (product.sleeveType) detailRows.push(['Sleeve', product.sleeveType]);
  if (product.pattern) detailRows.push(['Pattern', product.pattern]);
  if (product.color) detailRows.push(['Color', product.color]);
  if (product.secondaryColor) detailRows.push(['Secondary Color', product.secondaryColor]);
  if (product.occasion) detailRows.push(['Occasion', product.occasion]);
  if (product.collection) detailRows.push(['Collection', product.collection]);
  if (product.season) detailRows.push(['Season', product.season]);
  if (product.brand) detailRows.push(['Brand', product.brand]);
  if (product.availableSizes) detailRows.push(['Available Sizes', product.availableSizes.replace(/,/g, ', ')]);

  return (
    <main>
      <div className="mx-auto max-w-screen-2xl px-6 py-8 md:px-10 md:py-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="size-3" />
          <Link href={genderPath} className="hover:text-foreground">{product.gender}</Link>
          <ChevronRight className="size-3" />
          <span className="truncate text-foreground">{product.name}</span>
        </nav>

        {/* Gallery + info */}
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} badge={badge} />

          <div className="lg:sticky lg:top-24 lg:h-fit">
            <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
              {product.category.name}
            </span>
            <h1 className="mt-3 font-display text-3xl font-medium uppercase tracking-tight text-foreground md:text-4xl">
              {product.name}
            </h1>

            {/* Sale price display */}
            {product.salePrice && product.salePrice > 0 ? (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-[18px] font-bold text-red-600">
                  {formatPrice(product.salePrice)}
                </span>
                <span className="text-[15px] text-muted-foreground line-through">
                  {formatPrice(product.basePrice)}
                </span>
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-700">
                  {Math.round((1 - product.salePrice / product.basePrice) * 100)}% OFF
                </span>
              </div>
            ) : null}

            {/* Short description */}
            {product.shortDescription && (
              <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
                {product.shortDescription}
              </p>
            )}

            <div className="mt-8">
              <VariantSelector
                variants={product.variants}
                basePrice={product.basePrice}
                fabric={fabric}
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
                  ...(product.fullDescription
                    ? [{
                        title: 'Description',
                        content: (
                          <div
                            className="prose prose-sm max-w-none text-muted-foreground"
                            dangerouslySetInnerHTML={{ __html: product.fullDescription }}
                          />
                        ),
                      }]
                    : [{
                        title: 'Description',
                        content: <p>{product.description}</p>,
                      }]
                  ),
                  {
                    id: 'size-guide',
                    title: 'Product Detail',
                    content: (
                      <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                        {detailRows.map(([k, v]) => (
                          <div key={k} className="flex justify-between border-b border-primary/10 py-2">
                            <dt className="text-muted-foreground">{k}</dt>
                            <dd className="text-foreground">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    ),
                  },
                  {
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
                            {[['S', '36–38', '38'], ['M', '38–40', '39'], ['L', '40–42', '40'], ['XL', '42–44', '41']].map((r) => (
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
                      <div className="space-y-3">
                        {(product.weight || product.shippingLength) && (
                          <div className="rounded-lg bg-muted/30 p-3 text-[13px]">
                            <p className="font-medium text-foreground mb-1">Package Details</p>
                            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                              {product.weight && <span>Weight: {product.weight} kg</span>}
                              {product.shippingLength && <span>Length: {product.shippingLength} cm</span>}
                              {product.shippingWidth && <span>Width: {product.shippingWidth} cm</span>}
                              {product.shippingHeight && <span>Height: {product.shippingHeight} cm</span>}
                            </div>
                          </div>
                        )}
                        <ul className="list-inside list-disc space-y-1.5">
                          <li>Complimentary shipping on orders over Rs 10,000</li>
                          <li>Standard delivery in 3–5 business days</li>
                          <li>30-day returns &amp; exchanges on unworn items</li>
                          {product.shippingClass && (
                            <li>Shipping class: {product.shippingClass}</li>
                          )}
                        </ul>
                      </div>
                    ),
                  },
                ]}
              />
            </div>

            {/* Video */}
            {product.videoUrl && (
              <div className="mt-6">
                <a
                  href={product.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-primary/10 px-4 py-2.5 text-[13px] font-medium text-foreground hover:bg-muted/30 transition-colors"
                >
                  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  Watch Product Video
                </a>
              </div>
            )}

            <p className="mt-6 text-xs italic text-muted-foreground">
              Actual colour may vary slightly due to photographic lighting and
              your screen settings.
            </p>
          </div>
        </div>
      </div>

      {/* Care instructions */}
      {product.careInstructions && (
        <div className="mx-auto max-w-screen-2xl px-6 pb-6 md:px-10">
          <div className="rounded-xl bg-muted/30 p-5">
            <h3 className="text-[13px] font-semibold uppercase tracking-wide text-foreground mb-2">Care Instructions</h3>
            <p className="text-[14px] text-muted-foreground">{product.careInstructions}</p>
          </div>
        </div>
      )}

      <ProductReviews ratingAvg={product.ratingAvg} ratingCount={product.ratingCount} />
      <RecentlyViewed current={currentMini} />
      <YouMayAlsoLike products={related} />
    </main>
  );
}

