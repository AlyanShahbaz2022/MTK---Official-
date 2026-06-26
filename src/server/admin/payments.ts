import 'server-only';
import { prisma } from '@/lib/prisma';

/**
 * EasyPaisa orders awaiting manual payment verification:
 * method EASYPAISA, still UNPAID, with an uploaded proof.
 */
export async function getPendingPayments() {
  return prisma.order.findMany({
    where: {
      paymentMethod: 'EASYPAISA',
      paymentStatus: 'UNPAID',
      status: { not: 'CANCELLED' },
      paymentProofUrl: { not: null },
    },
    orderBy: { createdAt: 'asc' },
    include: {
      items: { select: { id: true, productName: true, quantity: true, image: true } },
    },
  });
}

/** Recently reviewed EasyPaisa orders (accepted or rejected). */
export async function getReviewedPayments(limit = 20) {
  return prisma.order.findMany({
    where: {
      paymentMethod: 'EASYPAISA',
      OR: [{ paymentStatus: 'PAID' }, { status: 'CANCELLED' }],
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
  });
}
