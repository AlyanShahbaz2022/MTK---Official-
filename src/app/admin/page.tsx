import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, PageHeader, StatusBadge } from '@/components/admin/ui';
import { Sparkline, BarChart, AreaChart, Doughnut } from '@/components/admin/charts';
import { cn } from '@/lib/utils';
import {
  stats,
  monthlySales,
  traffic,
  salesByCategory,
  orders,
  formatPKR,
} from '@/lib/admin/mock-data';

export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Welcome back — here's your store at a glance." />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-[20px]">
            <p className="text-[13px] font-medium text-slate-500">{s.label}</p>
            <div className="mt-[8px] flex items-end justify-between gap-[12px]">
              <div>
                <p className="text-[26px] font-bold tracking-tight text-slate-900">{s.value}</p>
                <p
                  className={cn(
                    'mt-[6px] inline-flex items-center gap-[3px] text-[12px] font-medium',
                    s.up ? 'text-emerald-600' : 'text-red-500',
                  )}
                >
                  {s.up ? <ArrowUpRight className="size-[14px]" /> : <ArrowDownRight className="size-[14px]" />}
                  {s.delta}
                </p>
              </div>
              <Sparkline
                data={s.spark}
                color={s.up ? '#10b981' : '#ef4444'}
                className="h-[36px] w-[96px]"
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="mt-[24px] grid grid-cols-1 gap-[16px] lg:grid-cols-3">
        <Card className="p-[20px]">
          <h3 className="text-[15px] font-semibold text-slate-900">Monthly Sales</h3>
          <p className="mb-[16px] text-[12px] text-slate-400">Revenue overview (Rs, thousands)</p>
          <BarChart data={monthlySales} />
        </Card>
        <Card className="p-[20px]">
          <h3 className="text-[15px] font-semibold text-slate-900">User Registrations</h3>
          <p className="mb-[16px] text-[12px] text-slate-400">Traffic trend (last 20 days)</p>
          <AreaChart data={traffic} />
        </Card>
        <Card className="p-[20px]">
          <h3 className="text-[15px] font-semibold text-slate-900">Sales by Category</h3>
          <p className="mb-[16px] text-[12px] text-slate-400">Share of total revenue</p>
          <Doughnut data={salesByCategory} />
        </Card>
      </div>

      {/* Recent orders */}
      <Card className="mt-[24px] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-[20px] py-[16px]">
          <h3 className="text-[15px] font-semibold text-slate-900">Recent Orders</h3>
          <a href="/admin/orders" className="text-[13px] font-medium text-indigo-600 hover:underline">
            View all
          </a>
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
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id} className="border-b border-slate-50 text-[14px] last:border-0">
                  <td className="px-[20px] py-[14px] font-medium text-slate-900">{o.id}</td>
                  <td className="px-[20px] py-[14px] text-slate-600">{o.customer}</td>
                  <td className="px-[20px] py-[14px] text-slate-500">{o.date}</td>
                  <td className="px-[20px] py-[14px] font-medium text-slate-900">{formatPKR(o.total)}</td>
                  <td className="px-[20px] py-[14px]">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
