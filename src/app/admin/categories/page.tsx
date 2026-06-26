'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, PageHeader } from '@/components/admin/ui';
import { Modal } from '@/components/admin/modal';
import { toast } from '@/store/admin-toast';
import { categories as seed, type AdminCategory } from '@/lib/admin/mock-data';

const inputCls =
  'h-[42px] w-full rounded-[10px] border border-slate-200 bg-white px-[14px] text-[14px] text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100';
const labelCls = 'mb-[6px] block text-[13px] font-medium text-slate-600';

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function CategoriesPage() {
  const [items, setItems] = useState<AdminCategory[]>(seed);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [name, setName] = useState('');
  const [toDelete, setToDelete] = useState<AdminCategory | null>(null);

  function openAdd() {
    setEditing(null);
    setName('');
    setFormOpen(true);
  }
  function openEdit(c: AdminCategory) {
    setEditing(c);
    setName(c.name);
    setFormOpen(true);
  }
  function save() {
    if (!name.trim()) {
      toast.error('Category name is required.');
      return;
    }
    if (editing) {
      setItems((l) => l.map((c) => (c.id === editing.id ? { ...c, name, slug: slugify(name) } : c)));
      toast.success('Category updated.');
    } else {
      setItems((l) => [{ id: `c${Date.now()}`, name, slug: slugify(name), products: 0 }, ...l]);
      toast.success('Category created.');
    }
    setFormOpen(false);
  }
  function confirmDelete() {
    if (!toDelete) return;
    setItems((l) => l.filter((c) => c.id !== toDelete.id));
    toast.success('Category deleted.');
    setToDelete(null);
  }

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle={`${items.length} categories`}
        action={
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex h-[42px] items-center gap-[8px] rounded-[10px] bg-indigo-600 px-[18px] text-[14px] font-semibold text-white hover:bg-indigo-700"
          >
            <Plus className="size-[18px]" /> Add Category
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <Card key={c.id} className="flex items-center justify-between p-[20px]">
            <div>
              <p className="text-[15px] font-semibold text-slate-900">{c.name}</p>
              <p className="mt-[2px] text-[12px] text-slate-400">/{c.slug}</p>
              <p className="mt-[10px] text-[13px] text-slate-500">{c.products} products</p>
            </div>
            <div className="flex flex-col gap-[6px]">
              <button
                type="button"
                onClick={() => openEdit(c)}
                aria-label="Edit"
                className="flex size-[34px] items-center justify-center rounded-[8px] text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <Pencil className="size-[16px]" />
              </button>
              <button
                type="button"
                onClick={() => setToDelete(c)}
                aria-label="Delete"
                className="flex size-[34px] items-center justify-center rounded-[8px] text-slate-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="size-[16px]" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Category' : 'Add Category'} size="sm">
        <label className={labelCls}>Category name</label>
        <input
          className={inputCls}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Luxury Pret"
          autoFocus
        />
        {name && <p className="mt-[8px] text-[12px] text-slate-400">Slug: /{slugify(name)}</p>}
        <div className="mt-[24px] flex justify-end gap-[10px]">
          <button
            type="button"
            onClick={() => setFormOpen(false)}
            className="h-[42px] rounded-[10px] border border-slate-200 px-[18px] text-[14px] font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            className="h-[42px] rounded-[10px] bg-indigo-600 px-[20px] text-[14px] font-semibold text-white hover:bg-indigo-700"
          >
            {editing ? 'Save' : 'Create'}
          </button>
        </div>
      </Modal>

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete category" size="sm">
        <p className="text-[14px] text-slate-600">
          Delete <span className="font-semibold text-slate-900">{toDelete?.name}</span>? Products in this
          category won&apos;t be deleted.
        </p>
        <div className="mt-[24px] flex justify-end gap-[10px]">
          <button
            type="button"
            onClick={() => setToDelete(null)}
            className="h-[42px] rounded-[10px] border border-slate-200 px-[18px] text-[14px] font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            className="h-[42px] rounded-[10px] bg-red-600 px-[20px] text-[14px] font-semibold text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Modal>
    </>
  );
}
