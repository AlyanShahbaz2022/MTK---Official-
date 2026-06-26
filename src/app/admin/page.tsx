import Link from 'next/link';
import { Wallet, ShoppingCart, Users, Package } from 'lucide-react';
import { Card, PageHeader } from '@/components/admin/ui';
import { BarChart, Doughnut } from '@/components/admin/charts';
import { getDashboardStats } from '@/server/admin/data';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-600 ring-amber-200',
  CONFIRMED: 'bg-blue-50 text-blue-600 ring-blue-200',
  PROCESSING: 'bg-indigo-50 text-indigo-600 ring-indigo-200',
  SHIPPED: 'bg-violet-50 text-violet-600 ring-violet-200',
  DELIVERED: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
  CANCELLED: 'bg-red-50 text-red-600 ring-red-200',
};

export default async function AdminDashboardPage() {
  const s = await getDashboardStats();

  const cards = [
    { label: 'Revenue (paid)', value: formatPrice(s.revenue), icon: Wallet, tint: 'text-emerald-600 bg-emerald-50' },
    { label: 'Total Orders', value: s.orderCount.toLocaleString('en-PK'), icon: ShoppingCart, tint: 'text-indigo-600 bg-indigo-50' },
    { label: 'Customers', value: s.userCount.toLocaleString('en-PK'), icon: Users, tint: 'text-sky-600 bg-sky-50' },
    { label: 'Products', value: s.productCount.toLocaleString('en-PK'), icon: Package, tint: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Welcome back — here's your store at a glance." />

      {s.pendingPayments > 0 && (
        <Link
          href="/admin/payments"
          className="mb-[20px] flex items-center justify-between rounded-[14px] border border-amber-200 bg-amber-50 px-[20px] py-[14px] text-[14px] text-amber-800 transition hover:bg-amber-100"
        >
          <span>
            <strong>{s.pendingPayments}</strong> EasyPaisa payment
            {s.pendingPayments === 1 ? '' : 's'} awaiting verification.
          </span>
          <span className="font-semibold">Review →</span>
        </Link>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-[20px]">
            <div className="flex items-center gap-[14px]">
              <span className={`flex size-[44px] items-center justify-center rounded-[12px] ${c.tint}`}>
                <c.icon className="size-[22px]" strokeWidth={1.8} />
              </span>
              <div>
                <p className="text-[13px] font-medium text-slate-500">{c.label}</p>
                <p className="text-[22px] font-bold tracking-tight text-slate-900">{c.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="mt-[24px] grid grid-cols-1 gap-[16px] lg:grid-cols-3">
        <Card className="p-[20px] lg:col-span-2">
          <h3 className="text-[15px] font-semibold text-slate-900">Monthly Sales</h3>
          <p className="mb-[16px] text-[12px] text-slate-400">Paid revenue, last 6 months (Rs)</p>
          <BarChart data={s.monthlySales} />
        </Card>
        <Card className="p-[20px]">
          <h3 className="text-[15px] font-semibold text-slate-900">Sales by Category</h3>
          <p className="mb-[16px] text-[12px] text-slate-400">Share of paid revenue</p>
          {s.salesByCategory.length > 0 ? (
            <Doughnut data={s.salesByCategory} />
          ) : (
            <p className="py-[40px] text-center text-[13px] text-slate-400">
              No paid sales yet.
            </p>
          )}
        </Card>
      </div>

      {/* Recent orders */}
      <Card className="mt-[24px] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-[20px] py-[16px]">
          <h3 className="text-[15px] font-semibold text-slate-900">Recent Orders</h3>
          <Link href="/admin/orders" className="text-[13px] font-medium text-indigo-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[12px] uppercase tracking-wide text-slate-400">
                <th className="px-[20px] py-[12px] font-medium">Order</th>
                <th className="px-[20px] py-[12px] font-medium">Customer</th>
                <th className="px-[20px] py-[12px] font-medium">Date</th>
                <th className="px-[20px] py-[12px] font-medium">Total</th>
                <th className="px-[20px] py-[12px] font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {s.recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-slate-50 text-[14px] last:border-0">
                  <td className="px-[20px] py-[14px] font-medium text-slate-900">{o.orderNumber}</td>
                  <td className="px-[20px] py-[14px] text-slate-600">{o.fullName}</td>
                  <td className="px-[20px] py-[14px] text-slate-500">
                    {new Date(o.createdAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-[20px] py-[14px] font-medium text-slate-900">{formatPrice(o.total)}</td>
                  <td className="px-[20px] py-[14px]">
                    <span
                      className={`inline-flex items-center rounded-full px-[10px] py-[3px] text-[12px] font-medium ring-1 ring-inset ${
                        STATUS_BADGE[o.status] ?? 'bg-slate-100 text-slate-500 ring-slate-200'
                      }`}
                    >
                      {o.status.charAt(0) + o.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                </tr>
              ))}
              {s.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-[20px] py-[40px] text-center text-[14px] text-slate-400">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
