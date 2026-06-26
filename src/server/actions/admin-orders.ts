'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { orderStatusSchema } from '@/schemas/admin';

export type ActionResult = { ok: boolean; error?: string };

/** Update an order's fulfilment status. */
export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const parsed = orderStatusSchema.safeParse({ orderId, status });
  if (!parsed.success) return { ok: false, error: 'Invalid status.' };

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    select: { id: true, orderNumber: true, items: { select: { variantId: true, quantity: true } } },
  });
  if (!order) return { ok: false, error: 'Order not found.' };

  // Restock when cancelling a previously non-cancelled order.
  if (parsed.data.status === 'CANCELLED') {
    const current = await prisma.order.findUnique({
      where: { id: order.id },
      select: { status: true },
    });
    if (current && current.status !== 'CANCELLED') {
      await prisma.$transaction([
        ...order.items
          .filter((i) => i.variantId)
          .map((i) =>
            prisma.productVariant.update({
              where: { id: i.variantId! },
              data: { stock: { increment: i.quantity } },
            }),
          ),
        prisma.order.update({
          where: { id: order.id },
          data: { status: 'CANCELLED' },
        }),
      ]);
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
      });
    }
  } else {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: parsed.data.status },
    });
  }

  await logAudit({
    action: 'ADMIN_ACTION',
    userId: admin.id,
    email: admin.email ?? undefined,
    meta: { type: 'order_status', orderNumber: order.orderNumber, status: parsed.data.status },
  });

  revalidatePath('/admin/orders');
  revalidatePath('/admin');
  return { ok: true };
}
