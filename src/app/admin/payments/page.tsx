import { CheckCircle2 } from 'lucide-react';
import { PageHeader, Card } from '@/components/admin/ui';
import { getPendingPayments } from '@/server/admin/payments';
import { formatPrice } from '@/lib/utils';
import {
  PaymentReviewCard,
  type PendingPayment,
} from '@/components/admin/payment-review-card';

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage() {
  const pending = await getPendingPayments();

  const payments: PendingPayment[] = pending.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    fullName: o.fullName,
    email: o.email,
    phone: o.phone,
    total: formatPrice(o.total),
    createdAt: new Date(o.createdAt).toLocaleString('en-PK', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
    proofUrl: o.paymentProofUrl!,
    items: o.items.map((i) => ({
      id: i.id,
      productName: i.productName,
      quantity: i.quantity,
    })),
  }));

  return (
    <>
      <PageHeader
        title="EasyPaisa Payments"
        subtitle="Review uploaded transaction screenshots and verify customer payments."
      />

      {payments.length === 0 ? (
        <Card className="flex flex-col items-center gap-[12px] py-[64px] text-center">
          <CheckCircle2 className="size-[40px] text-emerald-500" strokeWidth={1.25} />
          <p className="text-[16px] font-semibold text-slate-900">All caught up</p>
          <p className="text-[14px] text-slate-500">
            No EasyPaisa payments are waiting for verification.
          </p>
        </Card>
      ) : (
        <div className="space-y-[16px]">
          <p className="text-[14px] text-slate-500">
            {payments.length} payment{payments.length === 1 ? '' : 's'} awaiting review
          </p>
          {payments.map((p) => (
            <PaymentReviewCard key={p.id} payment={p} />
          ))}
        </div>
      )}
    </>
  );
}
