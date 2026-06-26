import { Card, PageHeader } from '@/components/admin/ui';
import { getAdminCustomers } from '@/server/admin/data';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const customers = await getAdminCustomers();

  return (
    <>
      <PageHeader title="Customers" subtitle={`${customers.length} registered customers`} />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[12px] uppercase tracking-wide text-slate-400">
                <th className="px-[20px] py-[12px] font-medium">Customer</th>
                <th className="px-[20px] py-[12px] font-medium">Orders</th>
                <th className="px-[20px] py-[12px] font-medium">Total Spent</th>
                <th className="px-[20px] py-[12px] font-medium">Status</th>
                <th className="px-[20px] py-[12px] font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 text-[14px] last:border-0 hover:bg-slate-50/60">
                  <td className="px-[20px] py-[14px]">
                    <div className="flex items-center gap-[12px]">
                      <span className="flex size-[38px] items-center justify-center rounded-full bg-indigo-100 text-[14px] font-semibold text-indigo-600">
                        {(c.name ?? c.email).charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-medium text-slate-900">{c.name ?? '—'}</p>
                        <p className="text-[12px] text-slate-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-[20px] py-[14px] text-slate-600">{c.orders}</td>
                  <td className="px-[20px] py-[14px] font-medium text-slate-900">{formatPrice(c.spent)}</td>
                  <td className="px-[20px] py-[14px]">
                    <span
                      className={`inline-flex items-center rounded-full px-[10px] py-[3px] text-[12px] font-medium ring-1 ring-inset ${
                        c.verified
                          ? 'bg-emerald-50 text-emerald-600 ring-emerald-200'
                          : 'bg-amber-50 text-amber-600 ring-amber-200'
                      }`}
                    >
                      {c.verified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="px-[20px] py-[14px] text-slate-500">
                    {new Date(c.joined).toLocaleDateString('en-PK', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-[20px] py-[48px] text-center text-[14px] text-slate-400">
                    No customers yet.
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
