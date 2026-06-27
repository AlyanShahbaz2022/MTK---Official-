import { config as loadEnv } from 'dotenv';
import { PrismaClient, type Gender } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Standalone script — load env ourselves (Prisma config does this for the CLI,
// but `tsx prisma/seed.ts` runs in its own process).
loadEnv({ path: '.env.local' });
loadEnv({ path: '.env' });

const prisma = new PrismaClient();

// Prices in minor units (paisa). 4500 PKR -> 450000.
const PKR = (rupees: number) => rupees * 100;

const SIZES = ['S', 'M', 'L', 'XL'];

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'alyan@gmail.com';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'alyan123';
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN', emailVerified: new Date() },
    create: {
      email,
      name: 'MTK Admin',
      role: 'ADMIN',
      passwordHash,
      emailVerified: new Date(),
    },
  });
  console.log(`Seeded admin: ${admin.email} (password: ${password})`);
}

interface SeedProduct {
  name: string;
  price: number; // rupees
  colors: string[];
  image: string;
  featured?: boolean;
}

const catalog: Array<{
  category: string;
  slug: string;
  gender: Gender;
  products: SeedProduct[];
}> = [
    {
      category: "Men's Shirts",
      slug: 'mens-shirts',
      gender: 'MEN',
      products: [
        {
          name: 'Classic Cotton Shirt',
          price: 3200,
          colors: ['White', 'Black'],
          image:
            'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
          featured: true,
        },
        {
          name: 'Linen Casual Shirt',
          price: 3800,
          colors: ['Beige', 'Blue'],
          image:
            'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
        },
      ],
    },
    {
      category: "Women's Dresses",
      slug: 'womens-dresses',
      gender: 'WOMEN',
      products: [
        {
          name: 'Embroidered Lawn Suit',
          price: 5500,
          colors: ['Maroon', 'Teal'],
          image:
            'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
          featured: true,
        },
        {
          name: 'Flowy Summer Dress',
          price: 4200,
          colors: ['Black', 'Floral'],
          image:
            'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800',
          featured: true,
        },
      ],
    },
    {
      category: 'Kids Wear',
      slug: 'kids-wear',
      gender: 'KIDS',
      products: [
        {
          name: 'Kids Printed Tee',
          price: 1500,
          colors: ['Yellow', 'Blue'],
          image:
            'https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?w=800',
          featured: true,
        },
      ],
    },
  ];

async function seedCatalog() {
  let productCount = 0;

  for (const group of catalog) {
    const category = await prisma.category.upsert({
      where: { slug: group.slug },
      update: {},
      create: { name: group.category, slug: group.slug, gender: group.gender },
    });

    for (const p of group.products) {
      const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const skuBase = slug.toUpperCase().replace(/-/g, '').slice(0, 8);

      await prisma.product.upsert({
        where: { slug },
        update: {},
        create: {
          name: p.name,
          slug,
          description: `${p.name} — premium quality, crafted for everyday comfort and style. Part of the MTK ${group.category} collection.`,
          basePrice: PKR(p.price),
          gender: group.gender,
          categoryId: category.id,
          isFeatured: p.featured ?? false,
          images: {
            create: [{ url: p.image, alt: p.name, position: 0 }],
          },
          variants: {
            create: p.colors.flatMap((color) =>
              SIZES.map((size) => ({
                size,
                color,
                sku: `${skuBase}-${color.slice(0, 3).toUpperCase()}-${size}`,
                stock: 25,
              })),
            ),
          },
        },
      });
      productCount++;
    }
  }
  console.log(`Seeded ${catalog.length} categories, ${productCount} products`);
}

async function seedCoupons() {
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: { code: 'WELCOME10', type: 'PERCENT', value: 10 },
  });
  await prisma.coupon.upsert({
    where: { code: 'FLAT500' },
    update: {},
    create: {
      code: 'FLAT500',
      type: 'FIXED',
      value: PKR(500),
      minSubtotal: PKR(5000),
    },
  });
  console.log('Seeded coupons: WELCOME10, FLAT500');
}

// ---------------------------------------------------------------------------
// Nav items — full 3-level tree (level 0=top | 1=group | 2=sub-item)
// ---------------------------------------------------------------------------
type NavSeed = {
  key: string; label: string; href: string;
  parentKey?: string; level: number; sortOrder: number;
};

const NAV_SEED: NavSeed[] = [
  // Top-level
  { key: 'men',   label: 'Men',   href: '/men',   level: 0, sortOrder: 0 },
  { key: 'women', label: 'Women', href: '/women', level: 0, sortOrder: 1 },
  { key: 'kids',  label: 'Kids',  href: '/kids',  level: 0, sortOrder: 2 },
  { key: 'shop',  label: 'Shop',  href: '/shop',  level: 0, sortOrder: 3 },
  // Men groups
  { key: 'men-eastern', label: 'Eastern Wear', href: '/men?category=eastern-wear', parentKey: 'men', level: 1, sortOrder: 0 },
  { key: 'men-tshirts', label: 'T-Shirts',     href: '/men?category=t-shirts',     parentKey: 'men', level: 1, sortOrder: 1 },
  { key: 'men-polo',    label: 'Polo',         href: '/men?category=polo',         parentKey: 'men', level: 1, sortOrder: 2 },
  { key: 'men-more',    label: 'More',         href: '/men',                       parentKey: 'men', level: 1, sortOrder: 3 },
  // Men › Eastern Wear
  { key: 'men-eastern-shalwar',   label: 'Shalwar Kameez', href: '/men?category=shalwar-kameez', parentKey: 'men-eastern', level: 2, sortOrder: 0 },
  { key: 'men-eastern-kurta',     label: 'Kurta',          href: '/men?category=kurta',          parentKey: 'men-eastern', level: 2, sortOrder: 1 },
  { key: 'men-eastern-waistcoat', label: 'Waist Coat',     href: '/men?category=waist-coat',     parentKey: 'men-eastern', level: 2, sortOrder: 2 },
  { key: 'men-eastern-kurta-pj',  label: 'Kurta Pajama',   href: '/men?category=kurta-pajama',   parentKey: 'men-eastern', level: 2, sortOrder: 3 },
  // Men › T-Shirts
  { key: 'men-tshirts-basic',     label: 'Basic T-Shirt',     href: '/men?category=basic-t-shirt',     parentKey: 'men-tshirts', level: 2, sortOrder: 0 },
  { key: 'men-tshirts-oversized', label: 'Oversized T-Shirt', href: '/men?category=oversized-t-shirt', parentKey: 'men-tshirts', level: 2, sortOrder: 1 },
  // Men › Polo
  { key: 'men-polo-basic',     label: 'Basic Polo',     href: '/men?category=basic-polo',     parentKey: 'men-polo', level: 2, sortOrder: 0 },
  { key: 'men-polo-classic',   label: 'Classic Polo',   href: '/men?category=classic-polo',   parentKey: 'men-polo', level: 2, sortOrder: 1 },
  { key: 'men-polo-signature', label: 'Signature Polo', href: '/men?category=signature-polo', parentKey: 'men-polo', level: 2, sortOrder: 2 },
  { key: 'men-polo-textured',  label: 'Textured Polo',  href: '/men?category=textured-polo',  parentKey: 'men-polo', level: 2, sortOrder: 3 },
  // Men › More
  { key: 'men-more-shirts',      label: 'Shirts',      href: '/men?category=shirts',      parentKey: 'men-more', level: 2, sortOrder: 0 },
  { key: 'men-more-bottoms',     label: 'Bottoms',     href: '/men?category=bottoms',     parentKey: 'men-more', level: 2, sortOrder: 1 },
  { key: 'men-more-accessories', label: 'Accessories', href: '/men?category=accessories', parentKey: 'men-more', level: 2, sortOrder: 2 },
  { key: 'men-more-unstitched',  label: 'Unstitched',  href: '/men?category=unstitched',  parentKey: 'men-more', level: 2, sortOrder: 3 },
  { key: 'men-more-fragrance',   label: 'Fragrance',   href: '/men?category=fragrance',   parentKey: 'men-more', level: 2, sortOrder: 4 },
  { key: 'men-more-outerwear',   label: 'Outerwear',   href: '/men?category=outerwear',   parentKey: 'men-more', level: 2, sortOrder: 5 },
  { key: 'men-more-home',        label: 'Home',        href: '/men?category=home',        parentKey: 'men-more', level: 2, sortOrder: 6 },
  // Women groups
  { key: 'women-collections', label: 'Collections', href: '/women', parentKey: 'women', level: 1, sortOrder: 0 },
  { key: 'women-fashion',     label: 'Fashion',     href: '/women', parentKey: 'women', level: 1, sortOrder: 1 },
  { key: 'women-more',        label: 'More',        href: '/women', parentKey: 'women', level: 1, sortOrder: 2 },
  // Women › Collections
  { key: 'women-col-rtw',      label: 'Ready to Wear', href: '/women?category=ready-to-wear', parentKey: 'women-collections', level: 2, sortOrder: 0 },
  { key: 'women-col-unstitch', label: 'Unstitched',   href: '/women?category=unstitched',    parentKey: 'women-collections', level: 2, sortOrder: 1 },
  { key: 'women-col-modest',   label: 'Modest Wear',  href: '/women?category=modest-wear',   parentKey: 'women-collections', level: 2, sortOrder: 2 },
  // Women › Fashion
  { key: 'women-fash-bags',     label: 'Bags',     href: '/women?category=bags',     parentKey: 'women-fashion', level: 2, sortOrder: 0 },
  { key: 'women-fash-west',     label: 'West',     href: '/women?category=west',     parentKey: 'women-fashion', level: 2, sortOrder: 1 },
  { key: 'women-fash-trousers', label: 'Trousers', href: '/women?category=trousers', parentKey: 'women-fashion', level: 2, sortOrder: 2 },
  // Women › More
  { key: 'women-more-fragrance', label: 'Fragrance', href: '/women?category=fragrance', parentKey: 'women-more', level: 2, sortOrder: 0 },
  { key: 'women-more-outerwear', label: 'Outerwear', href: '/women?category=outerwear', parentKey: 'women-more', level: 2, sortOrder: 1 },
  { key: 'women-more-home',      label: 'Home',      href: '/women?category=home',      parentKey: 'women-more', level: 2, sortOrder: 2 },
  // Kids groups
  { key: 'kids-shopby', label: 'Shop by', href: '/kids', parentKey: 'kids', level: 1, sortOrder: 0 },
  // Kids › Shop by
  { key: 'kids-shopby-boys',  label: 'Boys',  href: '/kids?category=boys',  parentKey: 'kids-shopby', level: 2, sortOrder: 0 },
  { key: 'kids-shopby-girls', label: 'Girls', href: '/kids?category=girls', parentKey: 'kids-shopby', level: 2, sortOrder: 1 },
];

async function seedNavItems() {
  for (const item of NAV_SEED) {
    await prisma.navItem.upsert({
      where: { key: item.key },
      update: { label: item.label, href: item.href, sortOrder: item.sortOrder },
      create: { ...item, parentKey: item.parentKey ?? null, isEnabled: true },
    });
  }
  console.log(`Seeded ${NAV_SEED.length} nav items`);
}

async function main() {
  await seedAdmin();
  await seedCatalog();
  await seedCoupons();
  await seedNavItems();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
