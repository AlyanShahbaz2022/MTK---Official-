const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const navItems = await prisma.navItem.findMany();
  console.log('Nav Items count:', navItems.length);
  console.log('Nav Items level 0:', navItems.filter(i => i.level === 0).map(i => ({ key: i.key, label: i.label, parentKey: i.parentKey })));
  console.log('Nav Items level 1:', navItems.filter(i => i.level === 1).map(i => ({ key: i.key, label: i.label, parentKey: i.parentKey })));
  console.log('Nav Items level 2:', navItems.filter(i => i.level === 2).map(i => ({ key: i.key, label: i.label, parentKey: i.parentKey })));
  
  const categories = await prisma.category.findMany({ include: { subCategories: true } });
  console.log('Categories count:', categories.length);
  console.log('Categories in DB:', JSON.stringify(categories, null, 2));
}

main().catch(err => console.error(err)).finally(() => prisma.$disconnect());
