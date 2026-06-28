import { config as loadEnv } from 'dotenv';
import { PrismaClient, type Gender } from '@prisma/client';
import bcrypt from 'bcryptjs';

loadEnv({ path: '.env.local' });
loadEnv({ path: '.env' });

const prisma = new PrismaClient();
const PKR = (rupees: number) => rupees * 100;
const SIZES = ['S', 'M', 'L', 'XL'];

// ─── Admin ────────────────────────────────────────────────────────────────────

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'alyan@gmail.com';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'alyan123';
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN', emailVerified: new Date() },
    create: { email, name: 'MTK Admin', role: 'ADMIN', passwordHash, emailVerified: new Date() },
  });
  console.log(`✅ Admin: ${admin.email} / ${password}`);
}

// ─── Catalog ──────────────────────────────────────────────────────────────────

interface SeedProduct {
  name: string;
  price: number;
  colors: string[];
  image: string;
  featured?: boolean;
}

const catalog: Array<{ category: string; slug: string; gender: Gender; products: SeedProduct[] }> = [
  // ── MEN ──────────────────────────────────────────────────────────────────
  {
    category: "Men's Eastern Wear",
    slug: 'mens-eastern-wear',
    gender: 'MEN',
    products: [
      { name: 'Embroidered Shalwar Kameez', price: 6500, colors: ['White', 'Beige', 'Navy'], image: 'https://images.unsplash.com/photo-1594938298603-c8148c4a5af3?w=800', featured: true },
      { name: 'Kurta Pajama Set', price: 5200, colors: ['White', 'Ivory', 'Grey'], image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800', featured: true },
      { name: 'Waist Coat Suit', price: 8900, colors: ['Black', 'Navy', 'Charcoal'], image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800' },
      { name: 'Kurta Only — Cotton', price: 3200, colors: ['White', 'Beige', 'Olive'], image: 'https://images.unsplash.com/photo-1604671368394-2240d0b1bb6c?w=800' },
    ],
  },
  {
    category: "Men's T-Shirts & Polo",
    slug: 'mens-tshirts-polo',
    gender: 'MEN',
    products: [
      { name: 'Classic Cotton T-Shirt', price: 1800, colors: ['White', 'Black', 'Grey', 'Navy'], image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800', featured: true },
      { name: 'Signature Polo Shirt', price: 3200, colors: ['White', 'Navy', 'Maroon', 'Forest'], image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800', featured: true },
      { name: 'Oversized Drop-Shoulder Tee', price: 2400, colors: ['Black', 'Cream', 'Olive'], image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800' },
      { name: 'Textured Pique Polo', price: 3500, colors: ['Navy', 'Olive', 'Burgundy'], image: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800' },
      { name: 'Graphic Print Tee', price: 1600, colors: ['Black', 'White'], image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800' },
    ],
  },
  {
    category: "Men's Shirts & Formals",
    slug: 'mens-shirts-formals',
    gender: 'MEN',
    products: [
      { name: 'Linen Casual Shirt', price: 3800, colors: ['Beige', 'Blue', 'White'], image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800', featured: true },
      { name: 'Slim Fit Dress Shirt', price: 4200, colors: ['White', 'Light Blue', 'Pale Pink'], image: 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800' },
      { name: 'Oxford Casual Shirt', price: 3900, colors: ['White', 'Navy', 'Check'], image: 'https://images.unsplash.com/photo-1564859228273-274232fdb516?w=800' },
    ],
  },

  // ── WOMEN ────────────────────────────────────────────────────────────────
  {
    category: "Women's Ready-to-Wear",
    slug: 'womens-ready-to-wear',
    gender: 'WOMEN',
    products: [
      { name: 'Embroidered Lawn 3-Piece', price: 7500, colors: ['Maroon', 'Teal', 'Dusty Rose'], image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800', featured: true },
      { name: 'Printed Chiffon Kurta', price: 4800, colors: ['Sage Green', 'Coral', 'Lilac'], image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800', featured: true },
      { name: 'Digital Print Lawn Suit', price: 5500, colors: ['Peach', 'Sky Blue', 'Mint'], image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800', featured: true },
      { name: 'Floral Maxi Dress', price: 5900, colors: ['Floral Red', 'Floral Blue'], image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800' },
      { name: 'Embroidered Khaddar Suit', price: 6200, colors: ['Burgundy', 'Forest Green', 'Charcoal'], image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800' },
      { name: 'Velvet Party Wear', price: 9800, colors: ['Maroon', 'Midnight Blue', 'Emerald'], image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800', featured: true },
    ],
  },
  {
    category: "Women's Unstitched",
    slug: 'womens-unstitched',
    gender: 'WOMEN',
    products: [
      { name: 'Premium Lawn Unstitched 3pc', price: 4500, colors: ['White', 'Ivory', 'Soft Blue'], image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800' },
      { name: 'Embroidered Chiffon Unstitched', price: 8800, colors: ['Gold', 'Silver', 'Rose Gold'], image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', featured: true },
      { name: 'Cotton Karandi 3-Piece', price: 5200, colors: ['Rust', 'Teal', 'Camel'], image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800' },
    ],
  },

  // ── KIDS ─────────────────────────────────────────────────────────────────
  {
    category: 'Kids Wear',
    slug: 'kids-wear',
    gender: 'KIDS',
    products: [
      { name: 'Kids Graphic Tee', price: 1200, colors: ['Yellow', 'Blue', 'Red'], image: 'https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?w=800', featured: true },
      { name: 'Girls Frock Set', price: 2800, colors: ['Pink', 'Purple', 'Aqua'], image: 'https://images.unsplash.com/photo-1543157145-f78c636d023d?w=800', featured: true },
      { name: 'Boys Kurta Shalwar', price: 2200, colors: ['White', 'Navy', 'Beige'], image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800' },
      { name: 'Kids Denim Joggers', price: 1800, colors: ['Blue', 'Black', 'Grey'], image: 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800' },
      { name: 'Girls Party Frock', price: 3500, colors: ['Pink', 'Lavender', 'Gold'], image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800', featured: true },
    ],
  },
];

async function seedCatalog() {
  // Clean up orphaned variants from any previous partial/failed seed run
  const allProductIds = (await prisma.product.findMany({ select: { id: true } })).map(p => p.id);
  await prisma.productVariant.deleteMany({ where: { productId: { notIn: allProductIds } } });
  await prisma.productImage.deleteMany({ where: { productId: { notIn: allProductIds } } });

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

      const existing = await prisma.product.findUnique({ where: { slug } });
      if (existing) { productCount++; continue; } // skip if already seeded

      await prisma.product.create({
        data: {
          name: p.name,
          slug,
          description: `${p.name} — premium quality, crafted for everyday comfort and style. Part of the MTK ${group.category} collection.`,
          basePrice: PKR(p.price),
          gender: group.gender,
          categoryId: category.id,
          isFeatured: p.featured ?? false,
          images: { create: [{ url: p.image, alt: p.name, position: 0 }] },
          variants: {
            create: p.colors.flatMap((color) =>
              SIZES.map((size) => ({
                size, color,
                sku: `${skuBase}-${color.slice(0, 3).toUpperCase()}-${size}`,
                stock: Math.floor(Math.random() * 40) + 10,
              })),
            ),
          },
        },
      });
      productCount++;
    }
  }
  console.log(`✅ Seeded ${catalog.length} categories, ${productCount} products`);
}

// ─── Coupons ──────────────────────────────────────────────────────────────────

async function seedCoupons() {
  await prisma.coupon.upsert({ where: { code: 'WELCOME10' }, update: {}, create: { code: 'WELCOME10', type: 'PERCENT', value: 10 } });
  await prisma.coupon.upsert({ where: { code: 'FLAT500' }, update: {}, create: { code: 'FLAT500', type: 'FIXED', value: PKR(500), minSubtotal: PKR(5000) } });
  await prisma.coupon.upsert({ where: { code: 'EID30' }, update: {}, create: { code: 'EID30', type: 'PERCENT', value: 30, minSubtotal: PKR(8000) } });
  console.log('✅ Seeded coupons: WELCOME10, FLAT500, EID30');
}

// ─── Nav items ────────────────────────────────────────────────────────────────

type NavSeed = { key: string; label: string; href: string; parentKey?: string; level: number; sortOrder: number };

const NAV_SEED: NavSeed[] = [
  // Departments
  { key: 'men',   label: 'Men',   href: '/men',   level: 0, sortOrder: 0 },
  { key: 'women', label: 'Women', href: '/women', level: 0, sortOrder: 1 },
  { key: 'kids',  label: 'Kids',  href: '/kids',  level: 0, sortOrder: 2 },

  // Men → Categories
  { key: 'men-eastern', label: 'Eastern Wear', href: '/men?category=eastern-wear', parentKey: 'men', level: 1, sortOrder: 0 },
  { key: 'men-tshirts', label: 'T-Shirts & Polo', href: '/men?category=tshirts-polo', parentKey: 'men', level: 1, sortOrder: 1 },
  { key: 'men-shirts',  label: 'Shirts & Formals', href: '/men?category=shirts-formals', parentKey: 'men', level: 1, sortOrder: 2 },

  // Men → Eastern Wear sub-categories
  { key: 'men-eastern-shalwar',  label: 'Shalwar Kameez', href: '/men?category=eastern-wear&sub=shalwar-kameez', parentKey: 'men-eastern', level: 2, sortOrder: 0 },
  { key: 'men-eastern-kurta',    label: 'Kurta',          href: '/men?category=eastern-wear&sub=kurta',          parentKey: 'men-eastern', level: 2, sortOrder: 1 },
  { key: 'men-eastern-waistcoat',label: 'Waist Coat',     href: '/men?category=eastern-wear&sub=waist-coat',     parentKey: 'men-eastern', level: 2, sortOrder: 2 },

  // Men → T-Shirts sub-categories
  { key: 'men-tshirts-basic',     label: 'Basic T-Shirt',     href: '/men?category=tshirts-polo&sub=basic',     parentKey: 'men-tshirts', level: 2, sortOrder: 0 },
  { key: 'men-tshirts-oversized', label: 'Oversized',         href: '/men?category=tshirts-polo&sub=oversized', parentKey: 'men-tshirts', level: 2, sortOrder: 1 },
  { key: 'men-tshirts-polo',      label: 'Polo',              href: '/men?category=tshirts-polo&sub=polo',      parentKey: 'men-tshirts', level: 2, sortOrder: 2 },
  { key: 'men-tshirts-graphic',   label: 'Graphic Tees',      href: '/men?category=tshirts-polo&sub=graphic',   parentKey: 'men-tshirts', level: 2, sortOrder: 3 },

  // Men → Shirts sub-categories
  { key: 'men-shirts-linen',   label: 'Linen Shirts',   href: '/men?category=shirts-formals&sub=linen',   parentKey: 'men-shirts', level: 2, sortOrder: 0 },
  { key: 'men-shirts-formal',  label: 'Dress Shirts',   href: '/men?category=shirts-formals&sub=formal',  parentKey: 'men-shirts', level: 2, sortOrder: 1 },
  { key: 'men-shirts-oxford',  label: 'Oxford Shirts',  href: '/men?category=shirts-formals&sub=oxford',  parentKey: 'men-shirts', level: 2, sortOrder: 2 },

  // Women → Categories
  { key: 'women-rtw',       label: 'Ready-to-Wear', href: '/women?category=ready-to-wear', parentKey: 'women', level: 1, sortOrder: 0 },
  { key: 'women-unstitched',label: 'Unstitched',    href: '/women?category=unstitched',    parentKey: 'women', level: 1, sortOrder: 1 },

  // Women → Ready-to-Wear sub-categories
  { key: 'women-rtw-lawn',    label: 'Lawn Suits',    href: '/women?category=ready-to-wear&sub=lawn',    parentKey: 'women-rtw', level: 2, sortOrder: 0 },
  { key: 'women-rtw-chiffon', label: 'Chiffon Kurta', href: '/women?category=ready-to-wear&sub=chiffon', parentKey: 'women-rtw', level: 2, sortOrder: 1 },
  { key: 'women-rtw-party',   label: 'Party Wear',    href: '/women?category=ready-to-wear&sub=party',   parentKey: 'women-rtw', level: 2, sortOrder: 2 },
  { key: 'women-rtw-khaddar', label: 'Khaddar',       href: '/women?category=ready-to-wear&sub=khaddar', parentKey: 'women-rtw', level: 2, sortOrder: 3 },

  // Women → Unstitched sub-categories
  { key: 'women-unst-lawn',    label: 'Lawn',     href: '/women?category=unstitched&sub=lawn',    parentKey: 'women-unstitched', level: 2, sortOrder: 0 },
  { key: 'women-unst-chiffon', label: 'Chiffon',  href: '/women?category=unstitched&sub=chiffon', parentKey: 'women-unstitched', level: 2, sortOrder: 1 },
  { key: 'women-unst-karandi', label: 'Karandi',  href: '/women?category=unstitched&sub=karandi', parentKey: 'women-unstitched', level: 2, sortOrder: 2 },

  // Kids → Categories
  { key: 'kids-boys',  label: 'Boys',  href: '/kids?category=boys',  parentKey: 'kids', level: 1, sortOrder: 0 },
  { key: 'kids-girls', label: 'Girls', href: '/kids?category=girls', parentKey: 'kids', level: 1, sortOrder: 1 },

  // Kids → Boys sub-categories
  { key: 'kids-boys-tshirts', label: 'T-Shirts',     href: '/kids?category=boys&sub=tshirts', parentKey: 'kids-boys', level: 2, sortOrder: 0 },
  { key: 'kids-boys-kurta',   label: 'Kurta Shalwar', href: '/kids?category=boys&sub=kurta',   parentKey: 'kids-boys', level: 2, sortOrder: 1 },
  { key: 'kids-boys-bottoms', label: 'Bottoms',       href: '/kids?category=boys&sub=bottoms', parentKey: 'kids-boys', level: 2, sortOrder: 2 },

  // Kids → Girls sub-categories
  { key: 'kids-girls-frocks',  label: 'Frocks',      href: '/kids?category=girls&sub=frocks',  parentKey: 'kids-girls', level: 2, sortOrder: 0 },
  { key: 'kids-girls-party',   label: 'Party Wear',  href: '/kids?category=girls&sub=party',   parentKey: 'kids-girls', level: 2, sortOrder: 1 },
  { key: 'kids-girls-casual',  label: 'Casual Wear', href: '/kids?category=girls&sub=casual',  parentKey: 'kids-girls', level: 2, sortOrder: 2 },
];

async function seedNavItems() {
  // Seed level 0 first, then 1, then 2 — to satisfy parentKey FK order
  for (const level of [0, 1, 2]) {
    for (const item of NAV_SEED.filter(n => n.level === level)) {
      await prisma.navItem.upsert({
        where: { key: item.key },
        update: { label: item.label, href: item.href, sortOrder: item.sortOrder },
        create: { ...item, parentKey: item.parentKey ?? null, isEnabled: true },
      });
    }
  }
  console.log(`✅ Seeded ${NAV_SEED.length} nav items`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding database…');
  await seedAdmin();
  await seedCatalog();
  await seedCoupons();
  await seedNavItems();
  console.log('🎉 Done!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
