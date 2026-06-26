import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-[14px] border border-slate-200 bg-white shadow-sm', className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-[24px] flex flex-wrap items-end justify-between gap-[16px]">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-[4px] text-[14px] text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const statusStyles: Record<string, string> = {
  Published: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
  Draft: 'bg-slate-100 text-slate-500 ring-slate-200',
  Pending: 'bg-amber-50 text-amber-600 ring-amber-200',
  Shipped: 'bg-indigo-50 text-indigo-600 ring-indigo-200',
  Delivered: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
  Canceled: 'bg-red-50 text-red-600 ring-red-200',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-[10px] py-[3px] text-[12px] font-medium ring-1 ring-inset',
        statusStyles[status] ?? 'bg-slate-100 text-slate-500 ring-slate-200',
      )}
    >
      {status}
    </span>
  );
}
