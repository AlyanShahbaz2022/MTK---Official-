import type { OrderStatus } from '@prisma/client';

const STYLES: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800' },
  PROCESSING: { label: 'Processing', className: 'bg-indigo-100 text-indigo-800' },
  SHIPPED: { label: 'Shipped', className: 'bg-violet-100 text-violet-800' },
  DELIVERED: { label: 'Delivered', className: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const s = STYLES[status];
  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] ${s.className}`}
    >
      {s.label}
    </span>
  );
}
