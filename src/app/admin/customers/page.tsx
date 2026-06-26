import { Card, PageHeader } from '@/components/admin/ui';
import { customers, formatPKR } from '@/lib/admin/mock-data';

export default function CustomersPage() {
  return (
    <>
      <PageHeader title="Customers" subtitle={`${customers.length} registered customers`} />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[12px] uppercase tracking-wide text-slate-400">
                <th className="px-[20px] py-[12px] font-medium">Customer</th>
                <th className="px-[20px] py-[12px] font-medium">Orders</th>
                <th className="px-[20px] py-[12px] font-medium">Total Spent</th>
                <th className="px-[20px] py-[12px] font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 text-[14px] last:border-0 hover:bg-slate-50/60">
                  <td className="px-[20px] py-[14px]">
                    <div className="flex items-center gap-[12px]">
                      <span className="flex size-[38px] items-center justify-center rounded-full bg-indigo-100 text-[14px] font-semibold text-indigo-600">
                        {c.name.charAt(0)}
                      </span>
                      <div>
                        <p className="font-medium text-slate-900">{c.name}</p>
                        <p className="text-[12px] text-slate-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-[20px] py-[14px] text-slate-600">{c.orders}</td>
                  <td className="px-[20px] py-[14px] font-medium text-slate-900">{formatPKR(c.spent)}</td>
                  <td className="px-[20px] py-[14px] text-slate-500">{c.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
