import { config as loadEnv } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Standalone script — load env ourselves (Prisma config does this for the CLI,
// but `tsx prisma/seed.ts` runs in its own process).
loadEnv({ path: '.env.local' });
loadEnv({ path: '.env' });

const prisma = new PrismaClient();

/**
 * Seed an initial ADMIN user so the dashboard is reachable after setup.
 * Override via env: SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD.
 */
async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@mtk.local';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345';

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN' },
    create: {
      email,
      name: 'MTK Admin',
      role: 'ADMIN',
      passwordHash,
    },
  });

  console.log(`Seeded admin: ${admin.email} (password: ${password})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
