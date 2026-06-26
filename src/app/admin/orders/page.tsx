'use client';

import { useState } from 'react';
import { Eye, Search } from 'lucide-react';
import { Card, PageHeader, StatusBadge } from '@/components/admin/ui';
import { Modal } from '@/components/admin/modal';
import { toast } from '@/store/admin-toast';
import {
  orders as seed,
  formatPKR,
  type AdminOrder,
  type OrderStatus,
} from '@/lib/admin/mock-data';

const STATUSES: OrderStatus[] = ['Pending', 'Shipped', 'Delivered', 'Canceled'];

export default function OrdersPage() {
  const [items, setItems] = useState<AdminOrder[]>(seed);
  const [filter, setFilter] = useState<'All' | OrderStatus>('All');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<AdminOrder | null>(null);

  const filtered = items.filter(
    (o) =>
      (filter === 'All' || o.status === filter) &&
      (o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.toLowerCase().includes(search.toLowerCase())),
  );

  function setStatus(id: string, status: OrderStatus) {
    setItems((l) => l.map((o) => (o.id === id ? { ...o, status } : o)));
    toast.success(`${id} marked ${status}.`);
  }

  return (
    <>
      <PageHeader title="Orders" subtitle={`${items.length} total orders`} />

      <Card className="overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-[12px] border-b border-slate-100 p-[16px]">
          <div className="flex flex-wrap gap-[6px]">
            {(['All', ...STATUSES] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={`rounded-[8px] px-[14px] py-[8px] text-[13px] font-medium transition-colors ${
                  filter === s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="relative ml-auto max-w-[300px] flex-1">
            <Search className="pointer-events-none absolute left-[14px] top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders…"
              className="h-[42px] w-full rounded-[10px] border border-slate-200 bg-slate-50 pl-[42px] pr-[14px] text-[14px] focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
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
                  <td className="px-[20px] py-[14px] font-medium text-slate-900">{o.id}</td>
                  <td className="px-[20px] py-[14px]">
                    <p className="text-slate-700">{o.customer}</p>
                    <p className="text-[12px] text-slate-400">{o.email}</p>
                  </td>
                  <td className="px-[20px] py-[14px] text-slate-500">{o.date}</td>
                  <td className="px-[20px] py-[14px] text-slate-500">{o.items}</td>
                  <td className="px-[20px] py-[14px] font-medium text-slate-900">{formatPKR(o.total)}</td>
                  <td className="px-[20px] py-[14px]">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-[20px] py-[14px]">
                    <div className="flex items-center justify-end gap-[8px]">
                      <select
                        value={o.status}
                        onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)}
                        aria-label="Update status"
                        className="h-[34px] rounded-[8px] border border-slate-200 bg-white px-[8px] text-[13px] text-slate-600 focus:border-indigo-400 focus:outline-none"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setView(o)}
                        aria-label="View receipt"
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

      {/* Receipt */}
      <Modal open={!!view} onClose={() => setView(null)} title={`Order ${view?.id ?? ''}`} size="md">
        {view && (
          <div className="space-y-[18px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[15px] font-semibold text-slate-900">{view.customer}</p>
                <p className="text-[13px] text-slate-400">{view.email}</p>
              </div>
              <StatusBadge status={view.status} />
            </div>
            <div className="grid grid-cols-2 gap-[12px] rounded-[12px] bg-slate-50 p-[16px] text-[13px]">
              <div>
                <p className="text-slate-400">Order date</p>
                <p className="font-medium text-slate-800">{view.date}</p>
              </div>
              <div>
                <p className="text-slate-400">Items</p>
                <p className="font-medium text-slate-800">{view.items}</p>
              </div>
              <div>
                <p className="text-slate-400">Order ID</p>
                <p className="font-medium text-slate-800">{view.id}</p>
              </div>
              <div>
                <p className="text-slate-400">Total</p>
                <p className="font-semibold text-slate-900">{formatPKR(view.total)}</p>
              </div>
            </div>
            <p className="text-[12px] text-slate-400">
              Full line-item receipts appear here once the orders backend is connected.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
