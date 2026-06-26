'use client';

import { useState, useTransition } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, PageHeader } from '@/components/admin/ui';
import { Modal } from '@/components/admin/modal';
import { toast } from '@/store/admin-toast';
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/server/actions/admin-categories';
import { GENDERS } from '@/schemas/admin';

export interface AdminCategoryRow {
  id: string;
  name: string;
  slug: string;
  gender: string;
  products: number;
}

const inputCls =
  'h-[42px] w-full rounded-[10px] border border-slate-200 bg-white px-[14px] text-[14px] text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100';
const labelCls = 'mb-[6px] block text-[13px] font-medium text-slate-600';

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function CategoriesClient({ categories }: { categories: AdminCategoryRow[] }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategoryRow | null>(null);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<string>('UNISEX');
  const [toDelete, setToDelete] = useState<AdminCategoryRow | null>(null);
  const [pending, startTransition] = useTransition();

  function openAdd() {
    setEditing(null);
    setName('');
    setGender('UNISEX');
    setFormOpen(true);
  }
  function openEdit(c: AdminCategoryRow) {
    setEditing(c);
    setName(c.name);
    setGender(c.gender);
    setFormOpen(true);
  }
  function save() {
    if (!name.trim()) {
      toast.error('Category name is required.');
      return;
    }
    startTransition(async () => {
      const res = editing
        ? await updateCategory(editing.id, { name, gender })
        : await createCategory({ name, gender });
      if (res.ok) {
        toast.success(editing ? 'Category updated.' : 'Category created.');
        setFormOpen(false);
      } else {
        toast.error(res.error ?? 'Could not save.');
      }
    });
  }
  function confirmDelete() {
    if (!toDelete) return;
    startTransition(async () => {
      const res = await deleteCategory(toDelete.id);
      if (res.ok) {
        toast.success('Category deleted.');
        setToDelete(null);
      } else {
        toast.error(res.error ?? 'Could not delete.');
      }
    });
  }

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle={`${categories.length} categories`}
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

      {categories.length === 0 ? (
        <Card className="py-[56px] text-center text-[14px] text-slate-400">
          No categories yet. Create your first one.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Card key={c.id} className="flex items-center justify-between p-[20px]">
              <div>
                <p className="text-[15px] font-semibold text-slate-900">{c.name}</p>
                <p className="mt-[2px] text-[12px] text-slate-400">/{c.slug} · {c.gender.toLowerCase()}</p>
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
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Category' : 'Add Category'} size="sm">
        <label className={labelCls}>Category name</label>
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Luxury Pret" autoFocus />
        {name && <p className="mt-[8px] text-[12px] text-slate-400">Slug: /{slugify(name)}</p>}
        <label className={`${labelCls} mt-[16px]`}>Department</label>
        <select className={inputCls} value={gender} onChange={(e) => setGender(e.target.value)}>
          {GENDERS.map((g) => (
            <option key={g} value={g}>
              {g.charAt(0) + g.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        <div className="mt-[24px] flex justify-end gap-[10px]">
          <button type="button" onClick={() => setFormOpen(false)} className="h-[42px] rounded-[10px] border border-slate-200 px-[18px] text-[14px] font-medium text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button type="button" onClick={save} disabled={pending} className="h-[42px] rounded-[10px] bg-indigo-600 px-[20px] text-[14px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
            {editing ? 'Save' : 'Create'}
          </button>
        </div>
      </Modal>

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete category" size="sm">
        <p className="text-[14px] text-slate-600">
          Delete <span className="font-semibold text-slate-900">{toDelete?.name}</span>? Categories with
          products can&apos;t be deleted.
        </p>
        <div className="mt-[24px] flex justify-end gap-[10px]">
          <button type="button" onClick={() => setToDelete(null)} className="h-[42px] rounded-[10px] border border-slate-200 px-[18px] text-[14px] font-medium text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button type="button" onClick={confirmDelete} disabled={pending} className="h-[42px] rounded-[10px] bg-red-600 px-[20px] text-[14px] font-semibold text-white hover:bg-red-700 disabled:opacity-50">
            Delete
          </button>
        </div>
      </Modal>
    </>
  );
}
