'use client';

import { useEffect, useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Eye,
  EyeOff,
  Menu,
  RefreshCw,
  Link as LinkIcon,
  Layers,
  Tag,
  LayoutGrid,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleNavItem, getAllNavItemsForAdmin } from '@/server/actions/admin-nav';
import { useToastStore } from '@/store/admin-toast';
import { Toaster } from '@/components/admin/toaster';
import { PageHeader } from '@/components/admin/ui';

type NavRow = {
  id: string;
  key: string;
  label: string;
  href: string;
  parentKey: string | null;
  level: number;
  sortOrder: number;
  isEnabled: boolean;
};

/** Inline toggle switch */
function Toggle({
  enabled,
  onChange,
  disabled,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
        enabled ? 'bg-indigo-500' : 'bg-slate-200',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block size-[16px] rounded-full bg-white shadow transition-transform duration-200',
          enabled ? 'translate-x-[20px]' : 'translate-x-[3px]',
        )}
      />
    </button>
  );
}

/** Badge showing level */
function LevelBadge({ level }: { level: number }) {
  if (level === 0)
    return (
      <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
        <Menu className="size-3" /> Top
      </span>
    );
  if (level === 1)
    return (
      <span className="flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-600">
        <Layers className="size-3" /> Group
      </span>
    );
  return (
    <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
      <Tag className="size-3" /> Item
    </span>
  );
}

/** A single row with label, href, badge, and toggle */
function NavRow({
  item,
  indent,
  parentDisabled,
  onToggle,
  pending,
}: {
  item: NavRow;
  indent: number;
  parentDisabled: boolean;
  onToggle: (key: string, val: boolean) => void;
  pending: boolean;
}) {
  const effectivelyDisabled = parentDisabled;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-[10px] px-3 py-2.5 transition-colors',
        effectivelyDisabled && item.level > 0
          ? 'opacity-40'
          : 'hover:bg-slate-50',
      )}
      style={{ paddingLeft: `${12 + indent * 20}px` }}
    >
      {/* Connector line for indented rows */}
      {indent > 0 && (
        <span className="mr-1 h-[1px] w-3 shrink-0 bg-slate-200" />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'truncate text-[13px] font-medium',
              item.isEnabled && !effectivelyDisabled
                ? 'text-slate-800'
                : 'text-slate-400 line-through',
            )}
          >
            {item.label}
          </span>
          <LevelBadge level={item.level} />
        </div>
        <div className="mt-0.5 flex items-center gap-1">
          <LinkIcon className="size-3 shrink-0 text-slate-300" />
          <span className="truncate text-[11px] text-slate-400">{item.href}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {effectivelyDisabled && item.level > 0 ? (
          <span className="text-[11px] text-slate-400">Parent off</span>
        ) : (
          <>
            {item.isEnabled ? (
              <Eye className="size-3.5 text-indigo-400" />
            ) : (
              <EyeOff className="size-3.5 text-slate-300" />
            )}
            <Toggle
              enabled={item.isEnabled}
              onChange={(v) => onToggle(item.key, v)}
              disabled={pending}
            />
          </>
        )}
      </div>
    </div>
  );
}

/** Collapsible top-level section card */
function TopSection({
  top,
  all,
  onToggle,
  pending,
}: {
  top: NavRow;
  all: NavRow[];
  onToggle: (key: string, val: boolean) => void;
  pending: boolean;
}) {
  const [open, setOpen] = useState(true);
  const groups = all.filter((n) => n.level === 1 && n.parentKey === top.key);

  // Stats
  const allChildren = all.filter(
    (n) => n.parentKey === top.key || groups.some((g) => g.key === n.parentKey),
  );
  const enabledChildren = allChildren.filter((n) => n.isEnabled).length;

  return (
    <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      {/* Top-level header row */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <LayoutGrid className="size-4 shrink-0 text-indigo-500" />
          <span className="text-[15px] font-semibold text-slate-900">
            {top.label}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
            {enabledChildren}/{allChildren.length} enabled
          </span>
          <ChevronDown
            className={cn(
              'ml-auto size-4 text-slate-400 transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </button>
        {/* Toggle for the top-level item itself */}
        <Toggle
          enabled={top.isEnabled}
          onChange={(v) => onToggle(top.key, v)}
          disabled={pending}
        />
      </div>

      {/* Children */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5 px-2 py-2">
              {groups.length === 0 && (
                <p className="px-3 py-2 text-[12px] text-slate-400">
                  No sub-items
                </p>
              )}
              {groups.map((group) => {
                const subItems = all.filter(
                  (n) => n.level === 2 && n.parentKey === group.key,
                );
                return (
                  <div key={group.key}>
                    <NavRow
                      item={group}
                      indent={1}
                      parentDisabled={!top.isEnabled}
                      onToggle={onToggle}
                      pending={pending}
                    />
                    {subItems.map((sub) => (
                      <NavRow
                        key={sub.key}
                        item={sub}
                        indent={2}
                        parentDisabled={!top.isEnabled || !group.isEnabled}
                        onToggle={onToggle}
                        pending={pending}
                      />
                    ))}
                  </div>
                );
              })}
              {/* If top-level has no groups, show it as a plain link (e.g. Shop) */}
              {groups.length === 0 && top.level === 0 && (
                <NavRow
                  item={top}
                  indent={0}
                  parentDisabled={false}
                  onToggle={onToggle}
                  pending={pending}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function NavManagerPage() {
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

  useEffect(() => {
    load();
  }, []);

  function handleToggle(key: string, val: boolean) {
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, isEnabled: val } : i)),
    );

    startTransition(async () => {
      const res = await toggleNavItem(key, val);
      if (res.error) {
        // Rollback
        setItems((prev) =>
          prev.map((i) => (i.key === key ? { ...i, isEnabled: !val } : i)),
        );
        toast.add(res.error, 'error');
      } else {
        toast.add(
          `"${items.find((i) => i.key === key)?.label}" ${val ? 'enabled' : 'disabled'} on storefront`,
          'success',
        );
      }
    });
  }

  const topItems = items.filter((n) => n.level === 0);
  const totalEnabled = items.filter((n) => n.isEnabled).length;

  return (
    <>
      <Toaster />
      <PageHeader
        title="Navigation Manager"
        subtitle="Control which links appear in the storefront navbar. Changes are instant."
      />

      {/* Summary bar */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-[12px] border border-slate-200 bg-white px-5 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-indigo-500" />
          <span className="text-[13px] text-slate-600">
            <strong className="text-slate-900">{totalEnabled}</strong> of{' '}
            <strong className="text-slate-900">{items.length}</strong> items
            visible
          </span>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading || isPending}
          className="ml-auto flex items-center gap-1.5 rounded-[8px] border border-slate-200 px-3 py-1.5 text-[12px] text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="size-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="space-y-4">
          {topItems.map((top) => (
            <TopSection
              key={top.key}
              top={top}
              all={items}
              onToggle={handleToggle}
              pending={isPending}
            />
          ))}
        </div>
      )}

      <p className="mt-6 text-[12px] text-slate-400">
        💡 Disabling a top-level link (e.g. "Men") hides its entire section
        including all groups and sub-items. Sub-item toggles are independent
        when the parent is enabled.
      </p>
    </>
  );
}
