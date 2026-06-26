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
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@mtk.local';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345';
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

async function main() {
  await seedAdmin();
  await seedCatalog();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
