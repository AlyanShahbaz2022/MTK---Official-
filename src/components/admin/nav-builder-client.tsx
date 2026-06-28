'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, Plus, Pencil, Trash2, Link as LinkIcon,
  X, Building2, FolderOpen, Folder, Tag, CheckCircle2, XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  toggleNavItem,
  createNavItem,
  updateNavItem,
  deleteNavItem,
  getAllNavItemsForAdmin,
  type CreateNavItemInput,
} from '@/server/actions/admin-nav';
import { useToastStore } from '@/store/admin-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NavRow = {
  id: string; key: string; label: string; href: string;
  parentKey: string | null; level: number; sortOrder: number; isEnabled: boolean;
};

type ModalMode =
  | { type: 'add-dept' }
  | { type: 'add-cat'; parentKey: string; parentLabel: string; deptHref: string }
  | { type: 'add-sub'; parentKey: string; parentLabel: string; catSlug: string; deptHref: string }
  | { type: 'edit'; item: NavRow };

// ─── URL helpers ──────────────────────────────────────────────────────────────

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function autoHref(label: string, mode: ModalMode): string {
  const slug = slugify(label);
  if (!slug) return '';
  if (mode.type === 'add-dept') return `/${slug}`;
  if (mode.type === 'add-cat') return `${mode.deptHref}?category=${slug}`;
  if (mode.type === 'add-sub') return `${mode.deptHref}?category=${mode.catSlug}&sub=${slug}`;
  return mode.type === 'edit' ? mode.item.href : '';
}

// ─── Level config ─────────────────────────────────────────────────────────────

const LEVEL_CONFIG = {
  0: { icon: Building2, label: 'Department', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  1: { icon: FolderOpen, label: 'Category',   color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', dot: 'bg-violet-500' },
  2: { icon: Tag,        label: 'Sub-cat',    color: 'text-slate-500',  bg: 'bg-slate-50',  border: 'border-slate-200',  dot: 'bg-slate-400'  },
} as const;

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ enabled, onChange, disabled }: { enabled: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button" role="switch" aria-checked={enabled} disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 shadow-inner',
        enabled ? 'bg-indigo-500' : 'bg-slate-200',
      )}
    >
      <span className={cn(
        'inline-flex size-5 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200 text-[9px] font-bold',
        enabled ? 'translate-x-6 text-indigo-500' : 'translate-x-1 text-slate-400',
      )}>
        {enabled ? '✓' : '✕'}
      </span>
    </button>
  );
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

function NavModal({ mode, onClose, onSave, pending }: {
  mode: ModalMode; onClose: () => void;
  onSave: (label: string, href: string) => void; pending: boolean;
}) {
  const isEdit = mode.type === 'edit';
  const [label, setLabel] = useState(isEdit ? mode.item.label : '');
  const preview = isEdit ? mode.item.href : autoHref(label, mode);

  const meta = {
    'add-dept': { title: 'Add Department', subtitle: 'Top-level nav item (e.g. Men, Women)', placeholder: 'e.g. Men', color: 'bg-indigo-600', icon: Building2 },
    'add-cat':  { title: `Add Category`, subtitle: `Under "${(mode as any).parentLabel}"`, placeholder: 'e.g. Eastern Wear', color: 'bg-violet-600', icon: FolderOpen },
    'add-sub':  { title: `Add Sub-category`, subtitle: `Under "${(mode as any).parentLabel}"`, placeholder: 'e.g. Shalwar Kameez', color: 'bg-slate-600', icon: Tag },
    'edit':     { title: `Rename`, subtitle: `Editing "${(mode as any).item?.label}"`, placeholder: '', color: 'bg-indigo-600', icon: Pencil },
  }[mode.type];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[420px] overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Colored top bar */}
        <div className={cn('flex items-center gap-3 px-5 py-4', meta.color)}>
          <meta.icon className="size-5 text-white/90" />
          <div>
            <p className="text-[15px] font-bold text-white">{meta.title}</p>
            <p className="text-[12px] text-white/70">{meta.subtitle}</p>
          </div>
          <button type="button" onClick={onClose} className="ml-auto flex size-7 items-center justify-center rounded-lg bg-white/15 text-white hover:bg-white/25">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5">
          {/* Name input */}
          <label className="mb-2 block text-[13px] font-semibold text-slate-700">Name</label>
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={meta.placeholder}
            onKeyDown={(e) => e.key === 'Enter' && label.trim() && onSave(label, preview)}
            className="h-[44px] w-full rounded-[10px] border border-slate-200 bg-slate-50 px-4 text-[14px] font-medium text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-3 focus:ring-indigo-100"
          />

          {/* URL preview */}
          {!isEdit && (
            <div className="mt-3">
              <p className="mb-1.5 text-[12px] font-medium text-slate-500">Auto-generated URL</p>
              <div className={cn(
                'flex items-center gap-2 rounded-[8px] border px-3 py-2 transition-colors',
                preview ? 'border-indigo-100 bg-indigo-50' : 'border-slate-100 bg-slate-50',
              )}>
                <LinkIcon className={cn('size-3.5 shrink-0', preview ? 'text-indigo-400' : 'text-slate-300')} />
                <span className={cn('truncate font-mono text-[12px]', preview ? 'text-indigo-700' : 'italic text-slate-400')}>
                  {preview || 'type a name to preview…'}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-5 flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 h-[42px] rounded-[10px] border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="button" disabled={pending || !label.trim()} onClick={() => onSave(label, preview)}
              className={cn('flex-1 h-[42px] rounded-[10px] text-[13px] font-bold text-white transition-opacity disabled:opacity-50', meta.color, 'hover:opacity-90')}>
              {pending ? 'Saving…' : isEdit ? 'Save' : 'Create'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({ item, childCount, onClose, onConfirm, pending }: {
  item: NavRow; childCount: number; onClose: () => void; onConfirm: () => void; pending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.18 }}
        className="relative w-full max-w-[380px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center gap-3 bg-red-500 px-5 py-4">
          <Trash2 className="size-5 text-white/90" />
          <p className="text-[15px] font-bold text-white">Delete "{item.label}"</p>
          <button type="button" onClick={onClose} className="ml-auto flex size-7 items-center justify-center rounded-lg bg-white/15 text-white hover:bg-white/25"><X className="size-4" /></button>
        </div>
        <div className="p-5">
          <p className="text-[13px] text-slate-600">
            {childCount > 0
              ? <>This will also delete <strong className="text-slate-900">{childCount} child item{childCount > 1 ? 's' : ''}</strong> permanently.</>
              : 'This action cannot be undone.'
            }
          </p>
          <div className="mt-5 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 h-[42px] rounded-[10px] border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={onConfirm} disabled={pending} className="flex-1 h-[42px] rounded-[10px] bg-red-500 text-[13px] font-bold text-white hover:bg-red-600 disabled:opacity-50">
              {pending ? 'Deleting…' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Sub-category row ─────────────────────────────────────────────────────────

function SubCatRow({ item, parentDisabled, onToggle, onEdit, onDelete, pending, isLast }: {
  item: NavRow; parentDisabled: boolean; isLast: boolean;
  onToggle: (k: string, v: boolean) => void; onEdit: (i: NavRow) => void;
  onDelete: (i: NavRow) => void; pending: boolean;
}) {
  return (
    <div className="relative flex items-center gap-3 py-2 pl-[52px] pr-3">
      {/* Tree line */}
      <span className="absolute left-[18px] top-0 h-full w-px bg-slate-100" style={{ display: isLast ? 'none' : 'block' }} />
      <span className="absolute left-[18px] top-1/2 h-px w-[18px] bg-slate-100" />

      <Tag className="size-4 shrink-0 text-slate-400" />
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-[13px] font-medium', item.isEnabled && !parentDisabled ? 'text-slate-700' : 'text-slate-400 line-through opacity-60')}>{item.label}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Toggle enabled={item.isEnabled} onChange={(v) => onToggle(item.key, v)} disabled={pending || parentDisabled} />
        <button type="button" onClick={() => onEdit(item)} title="Rename"
          className="flex items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-500 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
          style={{ width: 32, height: 32 }}>
          <Pencil style={{ width: 14, height: 14 }} />
        </button>
        <button type="button" onClick={() => onDelete(item)} title="Delete"
          className="flex items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-500 shadow-sm hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          style={{ width: 32, height: 32 }}>
          <Trash2 style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  );
}

// ─── Category row ─────────────────────────────────────────────────────────────

function CategoryRow({ group, subs, deptEnabled, deptHref, onToggle, onEdit, onDelete, onAddSub, pending }: {
  group: NavRow; subs: NavRow[]; deptEnabled: boolean; deptHref: string;
  onToggle: (k: string, v: boolean) => void; onEdit: (i: NavRow) => void;
  onDelete: (i: NavRow) => void; onAddSub: (pk: string, pl: string, catSlug: string, deptHref: string) => void;
  pending: boolean;
}) {
  const [open, setOpen] = useState(true);
  const disabled = !deptEnabled;

  return (
    <div className={cn('overflow-hidden rounded-[12px] border-2 transition-opacity', disabled ? 'opacity-50 border-slate-200 bg-slate-50' : 'border-violet-100 bg-white')}>
      {/* Category header */}
      <div className="flex items-center gap-3 border-b border-violet-100 bg-violet-50/60 px-3 py-3">
        <button type="button" onClick={() => setOpen(o => !o)} className="flex flex-1 items-center gap-2.5 text-left min-w-0">
          {open ? <FolderOpen className="size-5 shrink-0 text-violet-500" /> : <Folder className="size-5 shrink-0 text-violet-400" />}
          <span className={cn('truncate text-[14px] font-semibold', group.isEnabled && !disabled ? 'text-slate-800' : 'text-slate-400 line-through')}>{group.label}</span>
          <span className="shrink-0 rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-semibold text-violet-600">
            {subs.length} sub-{subs.length === 1 ? 'category' : 'categories'}
          </span>
          {subs.length > 0 && <ChevronDown className={cn('ml-auto size-4 shrink-0 text-slate-400 transition-transform duration-200', open && 'rotate-180')} />}
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <Toggle enabled={group.isEnabled} onChange={(v) => onToggle(group.key, v)} disabled={pending || disabled} />
          <button type="button" onClick={() => onEdit(group)} title="Rename category"
            className="flex items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-500 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
            style={{ width: 34, height: 34 }}>
            <Pencil style={{ width: 15, height: 15 }} />
          </button>
          <button type="button" onClick={() => onDelete(group)} title="Delete category"
            className="flex items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-500 shadow-sm hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            style={{ width: 34, height: 34 }}>
            <Trash2 style={{ width: 15, height: 15 }} />
          </button>
        </div>
      </div>

      {/* Sub-categories */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="relative py-1 pl-0">
              {/* Vertical connector */}
              {subs.length > 0 && <span className="absolute left-[18px] top-0 h-full w-px bg-slate-100" />}

              {subs.map((sub, idx) => (
                <SubCatRow key={sub.key} item={sub} parentDisabled={disabled || !group.isEnabled}
                  onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} pending={pending}
                  isLast={idx === subs.length - 1} />
              ))}

              {/* Add sub-category */}
              <button type="button" onClick={() => onAddSub(group.key, group.label, slugify(group.label), deptHref)}
                className="ml-[52px] mb-1.5 mt-1 flex items-center gap-1.5 rounded-[8px] px-2.5 py-1 text-[11px] font-semibold text-violet-500 hover:bg-violet-50">
                <Plus className="size-3" /> Add sub-category
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Department card ──────────────────────────────────────────────────────────

function DeptCard({ top, all, onToggle, onEdit, onDelete, onAddCat, onAddSub, pending }: {
  top: NavRow; all: NavRow[];
  onToggle: (k: string, v: boolean) => void; onEdit: (i: NavRow) => void;
  onDelete: (i: NavRow) => void;
  onAddCat: (pk: string, pl: string, deptHref: string) => void;
  onAddSub: (pk: string, pl: string, catSlug: string, deptHref: string) => void;
  pending: boolean;
}) {
  const [open, setOpen] = useState(true);
  const groups = all.filter(n => n.level === 1 && n.parentKey === top.key);
  const totalChildren = all.filter(n => n.parentKey === top.key || groups.some(g => g.key === n.parentKey)).length;

  return (
    <div className={cn('overflow-hidden rounded-[16px] border-2 transition-all duration-200',
      top.isEnabled ? 'border-indigo-200 bg-white shadow-md' : 'border-slate-200 bg-slate-50 opacity-70')}>

      {/* Department header */}
      <div className={cn('flex items-center gap-3 px-4 py-3.5',
        top.isEnabled ? 'bg-gradient-to-r from-indigo-50 to-violet-50' : 'bg-slate-100')}>

        <button type="button" onClick={() => setOpen(o => !o)} className="flex flex-1 items-center gap-3 text-left min-w-0">
          <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-[10px]',
            top.isEnabled ? 'bg-indigo-100' : 'bg-slate-200')}>
            <Building2 className={cn('size-4', top.isEnabled ? 'text-indigo-600' : 'text-slate-400')} />
          </div>
          <div className="min-w-0">
            <p className={cn('text-[15px] font-bold leading-tight', top.isEnabled ? 'text-slate-900' : 'text-slate-400 line-through')}>{top.label}</p>
            <p className="text-[11px] text-slate-400 font-mono">{top.href}</p>
          </div>
          <div className="ml-2 flex shrink-0 items-center gap-2">
            <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
              top.isEnabled ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500')}>
              {groups.length} {groups.length === 1 ? 'category' : 'categories'}
            </span>
            {top.isEnabled
              ? <CheckCircle2 className="size-4 text-emerald-500" />
              : <XCircle className="size-4 text-slate-300" />
            }
          </div>
          <ChevronDown className={cn('ml-1 size-4 shrink-0 text-slate-400 transition-transform duration-200', open && 'rotate-180')} />
        </button>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2 border-l border-indigo-200 pl-3">
          <Toggle enabled={top.isEnabled} onChange={(v) => onToggle(top.key, v)} disabled={pending} />
          <button type="button" onClick={() => onEdit(top)} title="Rename department"
            className="flex items-center justify-center rounded-[10px] border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
            style={{ width: 36, height: 36 }}>
            <Pencil style={{ width: 16, height: 16 }} />
          </button>
          <button type="button" onClick={() => onDelete(top)} title="Delete department"
            className="flex items-center justify-center rounded-[10px] border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            style={{ width: 36, height: 36 }}>
            <Trash2 style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>

      {/* Categories list */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="space-y-2 p-3">
              {groups.map(group => (
                <CategoryRow
                  key={group.key}
                  group={group}
                  subs={all.filter(n => n.level === 2 && n.parentKey === group.key)}
                  deptEnabled={top.isEnabled}
                  deptHref={top.href}
                  onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} onAddSub={onAddSub}
                  pending={pending}
                />
              ))}

              {groups.length === 0 && (
                <div className="rounded-[10px] border border-dashed border-slate-200 py-5 text-center">
                  <Folder className="mx-auto size-6 text-slate-300" />
                  <p className="mt-1.5 text-[12px] text-slate-400">No categories yet</p>
                </div>
              )}

              {/* Add category */}
              <button type="button" onClick={() => onAddCat(top.key, top.label, top.href)}
                className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-dashed border-indigo-200 py-2 text-[12px] font-semibold text-indigo-500 transition-colors hover:border-indigo-400 hover:bg-indigo-50">
                <Plus className="size-3.5" /> Add Category under {top.label}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function NavBuilderClient({ initialItems }: { initialItems: NavRow[] }) {
  const [items, setItems] = useState<NavRow[]>(initialItems);
  const [modal, setModal] = useState<ModalMode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NavRow | null>(null);
  const [isPending, startTransition] = useTransition();
  const toast = useToastStore();

  function getChildCount(key: string): number {
    const direct = items.filter(i => i.parentKey === key);
    return direct.length + direct.reduce((acc, c) => acc + getChildCount(c.key), 0);
  }

  function handleToggle(key: string, val: boolean) {
    setItems(prev => prev.map(i => i.key === key ? { ...i, isEnabled: val } : i));
    startTransition(async () => {
      const res = await toggleNavItem(key, val);
      if (res.error) {
        setItems(prev => prev.map(i => i.key === key ? { ...i, isEnabled: !val } : i));
        toast.add(res.error, 'error');
      } else {
        toast.add(`"${items.find(i => i.key === key)?.label}" ${val ? 'enabled' : 'disabled'}`, 'success');
      }
    });
  }

  function handleSave(label: string, href: string) {
    if (!modal) return;

    if (modal.type === 'edit') {
      const item = modal.item;
      const slug = slugify(label);
      const newHref = (() => {
        if (item.level === 0) return `/${slug}`;
        const parent = items.find(i => i.key === item.parentKey);
        if (item.level === 1 && parent) return `${parent.href}?category=${slug}`;
        if (item.level === 2 && parent) {
          const gp = items.find(i => i.key === parent.parentKey);
          return `${gp?.href ?? ''}?category=${slugify(parent.label)}&sub=${slug}`;
        }
        return href;
      })();
      startTransition(async () => {
        const res = await updateNavItem(item.key, { label, href: newHref });
        if (res.ok) {
          setItems(prev => prev.map(i => i.key === item.key ? { ...i, label, href: newHref } : i));
          toast.add(`"${label}" updated`, 'success');
          setModal(null);
        } else toast.add(res.error ?? 'Could not update.', 'error');
      });
      return;
    }

    const levelMap = { 'add-dept': 0, 'add-cat': 1, 'add-sub': 2 } as const;
    const input: CreateNavItemInput = {
      label, href,
      level: levelMap[modal.type] as 0 | 1 | 2,
      parentKey: modal.type !== 'add-dept' ? modal.parentKey : null,
    };
    startTransition(async () => {
      const res = await createNavItem(input);
      if (res.ok) {
        const fresh = await getAllNavItemsForAdmin();
        setItems(fresh as NavRow[]);
        setModal(null);
        toast.add(`"${label}" created`, 'success');
      } else toast.add(res.error ?? 'Could not create.', 'error');
    });
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const { key, label } = deleteTarget;
    startTransition(async () => {
      const res = await deleteNavItem(key);
      if (res.ok) {
        setItems(prev => {
          const removed = new Set<string>();
          const collect = (k: string) => { removed.add(k); prev.filter(i => i.parentKey === k).forEach(c => collect(c.key)); };
          collect(key);
          return prev.filter(i => !removed.has(i.key));
        });
        toast.add(`"${label}" deleted`, 'success');
        setDeleteTarget(null);
      } else toast.add(res.error ?? 'Could not delete.', 'error');
    });
  }

  const topItems = items.filter(n => n.level === 0);
  const cats = items.filter(i => i.level === 1);
  const subs = items.filter(i => i.level === 2);

  return (
    <>
      <AnimatePresence>
        {modal && <NavModal mode={modal} onClose={() => setModal(null)} onSave={handleSave} pending={isPending} />}
        {deleteTarget && (
          <DeleteModal item={deleteTarget} childCount={getChildCount(deleteTarget.key)}
            onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} pending={isPending} />
        )}
      </AnimatePresence>

      {/* Legend + Add button */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        {/* Stats */}
        <div className="flex flex-wrap items-center gap-3">
          {([
            { icon: Building2, label: 'Departments', count: topItems.length, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
            { icon: FolderOpen, label: 'Categories',  count: cats.length,     color: 'text-violet-600 bg-violet-50 border-violet-100' },
            { icon: Tag,        label: 'Sub-cats',    count: subs.length,     color: 'text-slate-600  bg-slate-50  border-slate-200' },
          ] as const).map(s => (
            <div key={s.label} className={cn('flex items-center gap-1.5 rounded-[10px] border px-3 py-1.5', s.color)}>
              <s.icon className="size-3.5" />
              <span className="text-[12px] font-semibold">{s.count} {s.label}</span>
            </div>
          ))}
        </div>

        <button type="button" onClick={() => setModal({ type: 'add-dept' })}
          className="inline-flex h-[40px] items-center gap-2 rounded-[10px] bg-indigo-600 px-5 text-[13px] font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all">
          <Plus className="size-4" /> Add Department
        </button>
      </div>

      {/* How it works hint */}
      {topItems.length === 0 && (
        <div className="mb-5 rounded-[12px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-[13px] font-semibold text-slate-700 mb-2">How to build your navigation:</p>
          <ol className="space-y-1 text-[12px] text-slate-500">
            <li><span className="font-semibold text-indigo-600">1. Add a Department</span> — e.g. "Men", "Women", "Kids"</li>
            <li><span className="font-semibold text-violet-600">2. Add Categories</span> — e.g. "Eastern Wear", "Western Wear"</li>
            <li><span className="font-semibold text-slate-600">3. Add Sub-categories</span> — e.g. "Shalwar Kameez", "Kurta"</li>
            <li><span className="font-semibold text-emerald-600">4. Toggle visibility</span> — control what shows on the storefront</li>
          </ol>
        </div>
      )}

      {/* Tree */}
      <div className="space-y-4">
        {topItems.map(top => (
          <DeptCard key={top.key} top={top} all={items}
            onToggle={handleToggle}
            onEdit={item => setModal({ type: 'edit', item })}
            onDelete={item => setDeleteTarget(item)}
            onAddCat={(pk, pl, deptHref) => setModal({ type: 'add-cat', parentKey: pk, parentLabel: pl, deptHref })}
            onAddSub={(pk, pl, catSlug, deptHref) => setModal({ type: 'add-sub', parentKey: pk, parentLabel: pl, catSlug, deptHref })}
            pending={isPending}
          />
        ))}
      </div>

      {topItems.length > 0 && (
        <p className="mt-4 text-[11px] text-slate-400">
          💡 URLs auto-generate from names · Disabling a department hides all its children · Deleting removes all children permanently
        </p>
      )}
    </>
  );
}
