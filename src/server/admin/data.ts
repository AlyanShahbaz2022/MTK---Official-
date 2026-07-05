import 'server-only';
import { prisma } from '@/lib/prisma';

/* ----------------------------- Orders ----------------------------- */

export async function getAdminOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      user: { select: { name: true, email: true } },
    },
  });
}

export async function getAdminOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: { select: { name: true, email: true } },
    },
  });
}

/* --------------------------- Categories --------------------------- */

export async function getAdminCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { products: true } },
      subCategories: {
        orderBy: { name: 'asc' },
        select: { id: true, name: true, slug: true },
      },
    },
  });
}

/* ---------------------------- Products ---------------------------- */

export async function getAdminProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      category: { select: { id: true, name: true } },
      subCategory: { select: { id: true, name: true } },
      images: { orderBy: { position: 'asc' } },
      variants: { select: { id: true, size: true, color: true, sku: true, stock: true } },
    },
  });
}

export async function getAdminProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      subCategory: true,
      images: { orderBy: { position: 'asc' } },
      variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] },
    },
  });
}

/* ---------------------------- Customers --------------------------- */

export async function getAdminCustomers() {
  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      emailVerified: true,
    },
  });

  // Aggregate spend + order count per user (only paid/confirmed orders count as spend).
  const grouped = await prisma.order.groupBy({
    by: ['userId'],
    _count: { _all: true },
    _sum: { total: true },
    where: { status: { not: 'CANCELLED' } },
  });
  const byUser = new Map(grouped.map((g) => [g.userId, g]));

  return users.map((u) => {
    const g = byUser.get(u.id);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      joined: u.createdAt,
      verified: Boolean(u.emailVerified),
      orders: g?._count._all ?? 0,
      spent: g?._sum.total ?? 0,
    };
  });
}

/* --------------------------- Dashboard ---------------------------- */

export async function getDashboardStats() {
  const [
    revenueAgg,
    orderCount,
    userCount,
    productCount,
    pendingPayments,
    recentOrders,
    statusGroups,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: 'PAID' },
    }),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.product.count(),
    prisma.order.count({
      where: {
        paymentMethod: 'EASYPAISA',
        paymentStatus: 'UNPAID',
        status: { not: 'CANCELLED' },
        paymentProofUrl: { not: null },
      },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        orderNumber: true,
        fullName: true,
        total: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);

  // Last 6 months of paid revenue (computed in JS for portability).
  const since = new Date();
  since.setMonth(since.getMonth() - 5);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const paidOrders = await prisma.order.findMany({
    where: { paymentStatus: 'PAID', createdAt: { gte: since } },
    select: { total: true, createdAt: true },
  });

  const months: { label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({
      label: d.toLocaleString('en-US', { month: 'short' }),
      value: 0,
    });
  }
  const baseMonth = new Date().getMonth();
  for (const o of paidOrders) {
    const diff =
      (new Date().getFullYear() - o.createdAt.getFullYear()) * 12 +
      (baseMonth - o.createdAt.getMonth());
    const idx = 5 - diff;
    const bucket = months[idx];
    if (bucket) bucket.value += Math.round(o.total / 100);
  }

  // Sales share by category. OrderItem keeps no variant relation (history is a
  // snapshot), so map via the productSlug snapshot -> product -> category.
  const paidItems = await prisma.orderItem.findMany({
    where: { order: { paymentStatus: 'PAID' }, productSlug: { not: null } },
    select: { lineTotal: true, productSlug: true },
  });
  const slugs = [...new Set(paidItems.map((i) => i.productSlug!).filter(Boolean))];
  const productCats = slugs.length
    ? await prisma.product.findMany({
        where: { slug: { in: slugs } },
        select: { slug: true, category: { select: { name: true } } },
      })
    : [];
  const slugToCat = new Map(productCats.map((p) => [p.slug, p.category.name]));

  const catTotals = new Map<string, number>();
  for (const it of paidItems) {
    const name = slugToCat.get(it.productSlug!) ?? 'Other';
    catTotals.set(name, (catTotals.get(name) ?? 0) + it.lineTotal);
  }
  const palette = ['#4f46e5', '#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
  const catTotal = [...catTotals.values()].reduce((a, b) => a + b, 0) || 1;
  const salesByCategory = [...catTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value], i) => ({
      label,
      value: Math.round((value / catTotal) * 100),
      color: palette[i % palette.length] ?? '#4f46e5',
    }));

  return {
    revenue: revenueAgg._sum.total ?? 0,
    orderCount,
    userCount,
    productCount,
    pendingPayments,
    recentOrders,
    statusGroups: statusGroups.map((s) => ({ status: s.status, count: s._count._all })),
    monthlySales: months,
    salesByCategory,
  };
}
