'use client';

import { useState, useTransition } from 'react';
import { Eye, Search } from 'lucide-react';
import { Card, PageHeader } from '@/components/admin/ui';
import { Modal } from '@/components/admin/modal';
import { toast } from '@/store/admin-toast';
import { updateOrderStatus } from '@/server/actions/admin-orders';
import { ORDER_STATUSES } from '@/schemas/admin';
import { formatPrice } from '@/lib/utils';

export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  phone: string;
  date: string;
  itemCount: number;
  total: number; // paisa
  subtotal: number;
  shipping: number;
  discount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  address: string;
  items: { id: string; productName: string; variantLabel: string; quantity: number; lineTotal: number; image: string | null }[];
}

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-600 ring-amber-200',
  CONFIRMED: 'bg-blue-50 text-blue-600 ring-blue-200',
  PROCESSING: 'bg-indigo-50 text-indigo-600 ring-indigo-200',
  SHIPPED: 'bg-violet-50 text-violet-600 ring-violet-200',
  DELIVERED: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
  CANCELLED: 'bg-red-50 text-red-600 ring-red-200',
};

function Badge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-[10px] py-[3px] text-[12px] font-medium ring-1 ring-inset ${
        STATUS_BADGE[status] ?? 'bg-slate-100 text-slate-500 ring-slate-200'
      }`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export function OrdersClient({ orders }: { orders: AdminOrderRow[] }) {
  const [filter, setFilter] = useState<'All' | string>('All');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<AdminOrderRow | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = orders.filter(
    (o) =>
      (filter === 'All' || o.status === filter) &&
      (o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.toLowerCase().includes(search.toLowerCase()) ||
        o.email.toLowerCase().includes(search.toLowerCase())),
  );

  function setStatus(id: string, status: string) {
    startTransition(async () => {
      const res = await updateOrderStatus(id, status);
      if (res.ok) toast.success(`Order marked ${status.toLowerCase()}.`);
      else toast.error(res.error ?? 'Could not update.');
    });
  }

  return (
    <>
      <PageHeader title="Orders" subtitle={`${orders.length} total orders`} />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-[10px] border-b border-slate-100 p-[12px] sm:flex-row sm:flex-wrap sm:items-center sm:gap-[12px] sm:p-[16px]">
          <div className="flex flex-wrap gap-[6px]">
            {(['All', ...ORDER_STATUSES] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={`rounded-[8px] px-[10px] py-[6px] text-[12px] sm:px-[12px] sm:py-[8px] sm:text-[13px] font-medium transition-colors ${
                  filter === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {s === 'All' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:ml-auto sm:max-w-[300px] sm:flex-1">
            <Search className="pointer-events-none absolute left-[14px] top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders…"
              className="h-[42px] w-full rounded-[10px] border border-slate-200 bg-slate-50 pl-[42px] pr-[14px] text-[14px] focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-slate-50 sm:hidden">
          {filtered.map((o) => (
            <div key={o.id} className="px-[12px] py-[10px]">
              <div className="flex items-start justify-between gap-[8px]">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-900">{o.orderNumber}</p>
                  <p className="truncate text-[12px] text-slate-500">{o.customer}</p>
                  <p className="text-[12px] text-slate-400">{o.date} · {formatPrice(o.total)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-[6px]">
                  <Badge status={o.status} />
                  <div className="flex items-center gap-[4px]">
                    <select
                      value={o.status}
                      disabled={pending}
                      onChange={(e) => setStatus(o.id, e.target.value)}
                      className="h-[28px] rounded-[6px] border border-slate-200 bg-white px-[6px] text-[11px] text-slate-600 focus:outline-none disabled:opacity-50"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => setView(o)} aria-label="View"
                      className="flex size-[28px] items-center justify-center rounded-[6px] text-slate-400 hover:bg-indigo-50 hover:text-indigo-600">
                      <Eye className="size-[13px]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="px-[12px] py-[40px] text-center text-[14px] text-slate-400">No orders found.</p>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[12px] uppercase tracking-wide text-slate-400">
                <th className="px-[20px] py-[12px] font-medium">Order</th>
                <th className="px-[20px] py-[12px] font-medium">Customer</th>
                <th className="px-[20px] py-[12px] font-medium">Date</th>
                <th className="px-[20px] py-[12px] font-medium">Items</th>
                <th className="px-[20px] py-[12px] font-medium">Total</th>
                <th className="px-[20px] py-[12px] font-medium">Status</th>
                <th className="px-[20px] py-[12px] text-right font-medium">Manage</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-slate-50 text-[14px] last:border-0 hover:bg-slate-50/60">
                  <td className="px-[20px] py-[14px] font-medium text-slate-900">{o.orderNumber}</td>
                  <td className="px-[20px] py-[14px]">
                    <p className="text-slate-700">{o.customer}</p>
                    <p className="text-[12px] text-slate-400">{o.email}</p>
                  </td>
                  <td className="px-[20px] py-[14px] text-slate-500">{o.date}</td>
                  <td className="px-[20px] py-[14px] text-slate-500">{o.itemCount}</td>
                  <td className="px-[20px] py-[14px] font-medium text-slate-900">{formatPrice(o.total)}</td>
                  <td className="px-[20px] py-[14px]">
                    <Badge status={o.status} />
                  </td>
                  <td className="px-[20px] py-[14px]">
                    <div className="flex items-center justify-end gap-[8px]">
                      <select
                        value={o.status}
                        disabled={pending}
                        onChange={(e) => setStatus(o.id, e.target.value)}
                        aria-label="Update status"
                        className="h-[34px] rounded-[8px] border border-slate-200 bg-white px-[8px] text-[13px] text-slate-600 focus:border-indigo-400 focus:outline-none disabled:opacity-50"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0) + s.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setView(o)}
                        aria-label="View order"
                        className="flex size-[34px] items-center justify-center rounded-[8px] text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <Eye className="size-[16px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-[20px] py-[48px] text-center text-[14px] text-slate-400">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Full receipt */}
      <Modal open={!!view} onClose={() => setView(null)} title={`Order ${view?.orderNumber ?? ''}`} size="lg">
        {view && (
          <div className="space-y-[18px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[15px] font-semibold text-slate-900">{view.customer}</p>
                <p className="text-[13px] text-slate-400">{view.email} · {view.phone}</p>
              </div>
              <Badge status={view.status} />
            </div>

            <div className="rounded-[12px] bg-slate-50 p-[16px] text-[13px]">
              <p className="text-slate-400">Shipping to</p>
              <p className="mt-[2px] font-medium text-slate-800">{view.address}</p>
              <p className="mt-[8px] text-slate-400">
                Payment: <span className="font-medium text-slate-700">{view.paymentMethod}</span> ·{' '}
                {view.paymentStatus.toLowerCase()}
              </p>
            </div>

            <div className="divide-y divide-slate-100 rounded-[12px] border border-slate-100">
              {view.items.map((it) => (
                <div key={it.id} className="flex items-center gap-[12px] p-[12px]">
                  <div className="size-[44px] shrink-0 overflow-hidden rounded-[8px] bg-slate-100">
                    {it.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.image} alt={it.productName} className="size-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium text-slate-900">{it.productName}</p>
                    <p className="text-[12px] text-slate-400">{it.variantLabel} · Qty {it.quantity}</p>
                  </div>
                  <span className="text-[14px] text-slate-700">{formatPrice(it.lineTotal)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-[6px] text-[14px]">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span><span>{formatPrice(view.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping</span><span>{view.shipping === 0 ? 'Free' : formatPrice(view.shipping)}</span>
              </div>
              {view.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span><span>−{formatPrice(view.discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-100 pt-[8px] text-[15px] font-semibold text-slate-900">
                <span>Total</span><span>{formatPrice(view.total)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
