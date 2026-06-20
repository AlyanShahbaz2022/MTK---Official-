import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductGallery } from '@/components/product/product-gallery';
import { VariantSelector } from '@/components/product/variant-selector';
import { getProductBySlug } from '@/server/products';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? 'Product' };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <main className="mx-auto max-w-7xl px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-7 text-md uppercase tracking-widest text-muted-foreground">
        <Link href="/shop" className="hover:text-text-primary">
          Shop
        </Link>
        {' / '}
        <Link
          href={`/${product.gender.toLowerCase()}`}
          className="hover:text-text-primary"
        >
          {product.category.name}
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} />

        <div className="space-y-7">
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold uppercase tracking-tight">
              {product.name}
            </h1>
            {product.ratingCount > 0 && (
              <p className="text-lg text-muted-foreground">
                ★ {product.ratingAvg.toFixed(1)} ({product.ratingCount})
              </p>
            )}
          </div>

          <VariantSelector
            variants={product.variants}
            basePrice={product.basePrice}
            product={{
              name: product.name,
              slug: product.slug,
              image: product.images[0]?.url,
            }}
          />

          <div className="border-t border-text-primary/10 pt-7">
            <h2 className="mb-3 text-md uppercase tracking-widest text-muted-foreground">
              Description
            </h2>
            <p className="text-base leading-relaxed text-text-primary">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
