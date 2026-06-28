import { prisma } from '../src/lib/prisma';

async function main() {
  const count = await prisma.navItem.deleteMany({});
  console.log(`✅ Deleted ${count.count} seeded nav items. Database is now clean.`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
