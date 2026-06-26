import { Card, PageHeader } from '@/components/admin/ui';
import { BarChart, AreaChart, Doughnut } from '@/components/admin/charts';
import { monthlySales, traffic, salesByCategory } from '@/lib/admin/mock-data';

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader title="Analytics" subtitle="Performance insights across your store." />

      <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-2">
        <Card className="p-[20px] lg:col-span-2">
          <h3 className="text-[15px] font-semibold text-slate-900">Monthly Revenue</h3>
          <p className="mb-[16px] text-[12px] text-slate-400">Sales performance over the year</p>
          <BarChart data={monthlySales} />
        </Card>
        <Card className="p-[20px]">
          <h3 className="text-[15px] font-semibold text-slate-900">User Growth</h3>
          <p className="mb-[16px] text-[12px] text-slate-400">New registrations trend</p>
          <AreaChart data={traffic} />
        </Card>
        <Card className="p-[20px]">
          <h3 className="text-[15px] font-semibold text-slate-900">Category Split</h3>
          <p className="mb-[16px] text-[12px] text-slate-400">Revenue by category</p>
          <Doughnut data={salesByCategory} />
        </Card>
      </div>
    </>
  );
}
