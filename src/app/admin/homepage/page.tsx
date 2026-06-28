'use client';

import { useEffect, useState, useTransition } from 'react';
import { Eye, EyeOff, RefreshCw, LayoutGrid, Layers, Tag, Building2, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getAllNavItemsForAdmin, toggleNavItem } from '@/server/actions/admin-nav';
import { useToastStore } from '@/store/admin-toast';
import { Toaster } from '@/components/admin/toaster';
import { PageHeader } from '@/components/admin/ui';

type NavRow = {
  id: string; key: string; label: string; href: string;
  parentKey: string | null; level: number; sortOrder: number; isEnabled: boolean;
};

function Toggle({ enabled, onChange, disabled }: { enabled: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={enabled} disabled={disabled} onClick={() => onChange(!enabled)}
      className={cn('relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50',
        enabled ? 'bg-indigo-500' : 'bg-slate-200')}>
      <span className={cn('pointer-events-none inline-block size-[16px] rounded-full bg-white shadow transition-transform duration-200',
        enabled ? 'translate-x-[20px]' : 'translate-x-[3px]')} />
    </button>
  );
}

function DeptToggleCard({ top, all, onToggle, pending }: {
  top: NavRow; all: NavRow[];
  onToggle: (key: string, val: boolean) => void; pending: boolean;
}) {
  const [open, setOpen] = useState(true);
  const groups = all.filter((n) => n.level === 1 && n.parentKey === top.key);
  const allChildren = all.filter((n) => n.parentKey === top.key || groups.some((g) => g.key === n.parentKey));
  const enabledCount = allChildren.filter((n) => n.isEnabled).length;

  return (
    <div className="overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm">
      {/* Department header */}
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3">
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex flex-1 items-center gap-3 text-left">
          <LayoutGrid className="size-4 shrink-0 text-indigo-500" />
          <span className="text-[15px] font-bold text-slate-900">{top.label}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
            {enabledCount}/{allChildren.length} visible
          </span>
          <ChevronDown className={cn('ml-auto size-4 text-slate-400 transition-transform duration-200', open && 'rotate-180')} />
        </button>
        <div className="flex shrink-0 items-center gap-2">
          {top.isEnabled ? <Eye className="size-4 text-indigo-400" /> : <EyeOff className="size-4 text-slate-300" />}
          <Toggle enabled={top.isEnabled} onChange={(v) => onToggle(top.key, v)} disabled={pending} />
        </div>
      </div>

      {/* Children */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="divide-y divide-slate-50 px-4">
              {groups.map((group) => {
                const subs = all.filter((n) => n.level === 2 && n.parentKey === group.key);
                return (
                  <div key={group.key} className="py-2">
                    {/* Category row */}
                    <div className={cn('flex items-center gap-2 py-1.5 pl-4', !top.isEnabled && 'opacity-40')}>
                      <Layers className="size-3.5 shrink-0 text-violet-400" />
                      <span className={cn('flex-1 text-[13px] font-medium', group.isEnabled && top.isEnabled ? 'text-slate-800' : 'text-slate-400 line-through')}>
                        {group.label}
                      </span>
                      <Toggle enabled={group.isEnabled} onChange={(v) => onToggle(group.key, v)} disabled={pending || !top.isEnabled} />
                    </div>
                    {/* Sub-categories */}
                    {subs.map((sub) => (
                      <div key={sub.key} className={cn('flex items-center gap-2 py-1 pl-10', (!top.isEnabled || !group.isEnabled) && 'opacity-40')}>
                        <Tag className="size-3 shrink-0 text-slate-300" />
                        <span className={cn('flex-1 text-[12px]', sub.isEnabled && group.isEnabled && top.isEnabled ? 'text-slate-600' : 'text-slate-400 line-through')}>
                          {sub.label}
                        </span>
                        <Toggle enabled={sub.isEnabled} onChange={(v) => onToggle(sub.key, v)} disabled={pending || !top.isEnabled || !group.isEnabled} />
                      </div>
                    ))}
                  </div>
                );
              })}
              {groups.length === 0 && (
                <p className="py-4 pl-4 text-[12px] text-slate-400">No categories — add them in the Categories section.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HomepageNavPage() {
  const [items, setItems] = useState<NavRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const toast = useToastStore();

  async function load() {
    setLoading(true);
    const data = await getAllNavItemsForAdmin();
    setItems(data as NavRow[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function handleToggle(key: string, val: boolean) {
    setItems((prev) => prev.map((i) => i.key === key ? { ...i, isEnabled: val } : i));
    startTransition(async () => {
      const res = await toggleNavItem(key, val);
      if (res.error) {
        setItems((prev) => prev.map((i) => i.key === key ? { ...i, isEnabled: !val } : i));
        toast.add(res.error, 'error');
      } else {
        toast.add(`"${items.find((i) => i.key === key)?.label}" ${val ? 'shown' : 'hidden'} on homepage`, 'success');
      }
    });
  }

  const topItems = items.filter((n) => n.level === 0);
  const totalVisible = items.filter((n) => n.isEnabled).length;

  return (
    <>
      <Toaster />
      <PageHeader
        title="Homepage Visibility"
        subtitle="Control which nav items appear on the storefront. To add or edit items, go to Categories → Navigation Structure."
      />

      {/* Summary */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-[12px] border border-slate-200 bg-white px-5 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-indigo-500" />
          <span className="text-[13px] text-slate-600">
            <strong className="text-slate-900">{totalVisible}</strong> of{' '}
            <strong className="text-slate-900">{items.length}</strong> items visible on storefront
          </span>
        </div>
        <button type="button" onClick={load} disabled={loading || isPending}
          className="ml-auto flex items-center gap-1.5 rounded-[8px] border border-slate-200 px-3 py-1.5 text-[12px] text-slate-600 hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      <div className="mb-3 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-[13px] text-amber-700">
          <strong>Tip:</strong> To add, rename or delete departments, categories and sub-categories — go to{' '}
          <strong>Categories → Navigation Structure</strong> tab.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="size-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="space-y-4">
          {topItems.map((top) => (
            <DeptToggleCard key={top.key} top={top} all={items} onToggle={handleToggle} pending={isPending} />
          ))}
          {topItems.length === 0 && (
            <div className="rounded-[16px] border border-dashed border-slate-300 py-16 text-center">
              <Building2 className="mx-auto size-10 text-slate-300" />
              <p className="mt-3 text-[14px] text-slate-400">
                No departments found. Add them in <strong>Categories → Navigation Structure</strong>.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
