'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/mailer';
import { paymentVerifiedEmail, paymentRejectedEmail } from '@/lib/email-templates';
import { formatPrice } from '@/lib/utils';
import { logAudit } from '@/lib/audit';

export type ReviewState = { error?: string; success?: string };

/** Accept an EasyPaisa payment: mark PAID + CONFIRMED, email the customer. */
export async function acceptPayment(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const admin = await requireAdmin();
  const orderId = String(formData.get('orderId') ?? '');
  if (!orderId) return { error: 'Missing order.' };

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: 'Order not found.' };
  if (order.paymentMethod !== 'EASYPAISA') {
    return { error: 'This order is not an EasyPaisa order.' };
  }
  if (order.paymentStatus === 'PAID') {
    return { error: 'This payment is already verified.' };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
      paymentVerifiedAt: new Date(),
      paymentReviewedBy: admin.id,
      paymentRejectReason: null,
    },
  });

  // Notify the customer (non-fatal if email fails).
  try {
    const { subject, html, text } = paymentVerifiedEmail({
      orderNumber: order.orderNumber,
      fullName: order.fullName,
      total: formatPrice(order.total),
    });
    await sendMail({ to: order.email, subject, html, text });
  } catch (err) {
    console.error('Payment-verified email failed:', err);
  }

  await logAudit({
    action: 'ADMIN_ACTION',
    userId: admin.id,
    email: admin.email ?? undefined,
    meta: { type: 'payment_accepted', orderNumber: order.orderNumber },
  });

  revalidatePath('/admin/payments');
  return { success: `Payment for ${order.orderNumber} verified.` };
}

/** Reject an EasyPaisa payment: restock, cancel, email the customer. */
export async function rejectPayment(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const admin = await requireAdmin();
  const orderId = String(formData.get('orderId') ?? '');
  const reason = String(formData.get('reason') ?? '').trim();
  if (!orderId) return { error: 'Missing order.' };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { error: 'Order not found.' };
  if (order.paymentStatus === 'PAID') {
    return { error: 'This payment is already verified and cannot be rejected.' };
  }

  // Restock and cancel atomically.
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
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'FAILED',
        paymentReviewedBy: admin.id,
        paymentRejectReason: reason || null,
      },
    }),
  ]);

  try {
    const { subject, html, text } = paymentRejectedEmail({
      orderNumber: order.orderNumber,
      fullName: order.fullName,
      reason: reason || undefined,
    });
    await sendMail({ to: order.email, subject, html, text });
  } catch (err) {
    console.error('Payment-rejected email failed:', err);
  }

  await logAudit({
    action: 'ADMIN_ACTION',
    userId: admin.id,
    email: admin.email ?? undefined,
    meta: { type: 'payment_rejected', orderNumber: order.orderNumber, reason },
  });

  revalidatePath('/admin/payments');
  return { success: `Payment for ${order.orderNumber} rejected.` };
}
