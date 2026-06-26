'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Upload } from 'lucide-react';
import { Card, PageHeader, StatusBadge } from '@/components/admin/ui';
import { Modal } from '@/components/admin/modal';
import { toast } from '@/store/admin-toast';
import {
  products as seed,
  categories,
  formatPKR,
  type AdminProduct,
} from '@/lib/admin/mock-data';

const inputCls =
  'h-[42px] w-full rounded-[10px] border border-slate-200 bg-white px-[14px] text-[14px] text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100';
const labelCls = 'mb-[6px] block text-[13px] font-medium text-slate-600';

type Draft = Omit<AdminProduct, 'id'>;

const empty: Draft = {
  name: '',
  sku: '',
  image: '',
  category: categories[0]?.name ?? '',
  stock: 0,
  price: 0,
  status: 'Draft',
};

export default function ProductsPage() {
  const [items, setItems] = useState<AdminProduct[]>(seed);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(empty);
  const [toDelete, setToDelete] = useState<AdminProduct | null>(null);

  const filtered = items.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()),
  );

  function openAdd() {
    setEditing(null);
    setDraft(empty);
    setFormOpen(true);
  }

  function openEdit(p: AdminProduct) {
    setEditing(p);
    const { id: _id, ...rest } = p;
    setDraft(rest);
    setFormOpen(true);
  }

  function save() {
    if (!draft.name.trim() || !draft.sku.trim()) {
      toast.error('Name and SKU are required.');
      return;
    }
    if (editing) {
      setItems((list) => list.map((p) => (p.id === editing.id ? { ...editing, ...draft } : p)));
      toast.success('Product updated.');
    } else {
      setItems((list) => [{ id: `p${Date.now()}`, ...draft }, ...list]);
      toast.success('Product created.');
    }
    setFormOpen(false);
  }

  function confirmDelete() {
    if (!toDelete) return;
    setItems((list) => list.filter((p) => p.id !== toDelete.id));
    toast.success('Product deleted.');
    setToDelete(null);
  }

  function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setDraft((d) => ({ ...d, image: URL.createObjectURL(file) }));
  }

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`${items.length} products in your catalog`}
        action={
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex h-[42px] items-center gap-[8px] rounded-[10px] bg-indigo-600 px-[18px] text-[14px] font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            <Plus className="size-[18px]" /> Add Product
          </button>
        }
      />

      <Card className="overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-slate-100 p-[16px]">
          <div className="relative max-w-[360px]">
            <Search className="pointer-events-none absolute left-[14px] top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or SKU…"
              className="h-[42px] w-full rounded-[10px] border border-slate-200 bg-slate-50 pl-[42px] pr-[14px] text-[14px] focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[12px] uppercase tracking-wide text-slate-400">
                <th className="px-[20px] py-[12px] font-medium">Product</th>
                <th className="px-[20px] py-[12px] font-medium">SKU</th>
                <th className="px-[20px] py-[12px] font-medium">Stock</th>
                <th className="px-[20px] py-[12px] font-medium">Price</th>
                <th className="px-[20px] py-[12px] font-medium">Status</th>
                <th className="px-[20px] py-[12px] text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 text-[14px] last:border-0 hover:bg-slate-50/60">
                  <td className="px-[20px] py-[12px]">
                    <div className="flex items-center gap-[12px]">
                      <div className="size-[44px] shrink-0 overflow-hidden rounded-[8px] bg-slate-100">
                        {p.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image} alt={p.name} className="size-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{p.name}</p>
                        <p className="text-[12px] text-slate-400">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-[20px] py-[12px] text-slate-500">{p.sku}</td>
                  <td className="px-[20px] py-[12px]">
                    <span className={p.stock === 0 ? 'font-medium text-red-500' : 'text-slate-700'}>
                      {p.stock === 0 ? 'Out of stock' : p.stock}
                    </span>
                  </td>
                  <td className="px-[20px] py-[12px] font-medium text-slate-900">{formatPKR(p.price)}</td>
                  <td className="px-[20px] py-[12px]">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-[20px] py-[12px]">
                    <div className="flex items-center justify-end gap-[6px]">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        aria-label="Edit"
                        className="flex size-[34px] items-center justify-center rounded-[8px] text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <Pencil className="size-[16px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setToDelete(p)}
                        aria-label="Delete"
                        className="flex size-[34px] items-center justify-center rounded-[8px] text-slate-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="size-[16px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-[20px] py-[48px] text-center text-[14px] text-slate-400">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
          {/* Image */}
          <div className="sm:col-span-2">
            <span className={labelCls}>Product image</span>
            <div className="flex items-center gap-[16px]">
              <div className="size-[88px] shrink-0 overflow-hidden rounded-[10px] border border-dashed border-slate-300 bg-slate-50">
                {draft.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={draft.image} alt="preview" className="size-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-[11px] text-slate-400">
                    No image
                  </span>
                )}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-[8px] rounded-[10px] border border-slate-200 px-[14px] py-[10px] text-[13px] font-medium text-slate-600 hover:bg-slate-50">
                <Upload className="size-[16px]" /> Upload
                <input type="file" accept="image/*" onChange={onImage} className="hidden" />
              </label>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Name</label>
            <input
              className={inputCls}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="e.g. Embroidered Lawn Suit"
            />
          </div>

          <div>
            <label className={labelCls}>SKU</label>
            <input
              className={inputCls}
              value={draft.sku}
              onChange={(e) => setDraft({ ...draft, sku: e.target.value })}
              placeholder="ABC-001"
            />
          </div>

          <div>
            <label className={labelCls}>Category</label>
            <select
              className={inputCls}
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Price (PKR)</label>
            <input
              type="number"
              className={inputCls}
              value={draft.price}
              onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className={labelCls}>Stock</label>
            <input
              type="number"
              className={inputCls}
              value={draft.stock}
              onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Status</label>
            <div className="flex gap-[10px]">
              {(['Published', 'Draft'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setDraft({ ...draft, status: s })}
                  className={`h-[42px] flex-1 rounded-[10px] border text-[14px] font-medium transition-colors ${
                    draft.status === s
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

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
            {editing ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete product" size="sm">
        <p className="text-[14px] text-slate-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-slate-900">{toDelete?.name}</span>? This action cannot be
          undone.
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
