'use client';

import { useState } from 'react';
import { Card, PageHeader } from '@/components/admin/ui';
import { toast } from '@/store/admin-toast';

const inputCls =
  'h-[42px] w-full rounded-[10px] border border-slate-200 bg-white px-[14px] text-[14px] text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100';
const labelCls = 'mb-[6px] block text-[13px] font-medium text-slate-600';

export default function SettingsPage() {
  const [store, setStore] = useState('MTK');
  const [email, setEmail] = useState('support@mtk.pk');
  const [currency, setCurrency] = useState('PKR');

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your store configuration." />

      <Card className="max-w-[640px] p-[24px]">
        <h3 className="text-[15px] font-semibold text-slate-900">Store details</h3>
        <div className="mt-[18px] space-y-[16px]">
          <div>
            <label className={labelCls}>Store name</label>
            <input className={inputCls} value={store} onChange={(e) => setStore(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Support email</label>
            <input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Currency</label>
            <select className={inputCls} value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="PKR">PKR — Pakistani Rupee</option>
              <option value="USD">USD — US Dollar</option>
            </select>
          </div>
        </div>
        <div className="mt-[24px] flex justify-end">
          <button
            type="button"
            onClick={() => toast.success('Settings saved.')}
            className="h-[42px] rounded-[10px] bg-indigo-600 px-[20px] text-[14px] font-semibold text-white hover:bg-indigo-700"
          >
            Save changes
          </button>
        </div>
      </Card>
    </>
  );
}
