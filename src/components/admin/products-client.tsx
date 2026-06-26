'use client';

import { useRef, useState, useTransition } from 'react';
import { Plus, Pencil, Trash2, Search, Upload } from 'lucide-react';
import { Card, PageHeader } from '@/components/admin/ui';
import { Modal } from '@/components/admin/modal';
import { toast } from '@/store/admin-toast';
import { createProduct, updateProduct, deleteProduct } from '@/server/actions/admin-products';
import { GENDERS } from '@/schemas/admin';
import { formatPrice } from '@/lib/utils';

export interface AdminProductRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  categoryId: string;
  categoryName: string;
  gender: string;
  price: number; // paisa
  stock: number; // summed across variants
  variantCount: number;
  isActive: boolean;
  isFeatured: boolean;
}

export interface CategoryOption {
  id: string;
  name: string;
}

const inputCls =
  'h-[42px] w-full rounded-[10px] border border-slate-200 bg-white px-[14px] text-[14px] text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100';
const labelCls = 'mb-[6px] block text-[13px] font-medium text-slate-600';

export function ProductsClient({
  products,
  categories,
}: {
  products: AdminProductRow[];
  categories: CategoryOption[];
}) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<AdminProductRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<AdminProductRow | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(search.toLowerCase()),
  );

  function openAdd() {
    setEditing(null);
    setPreview(null);
    setIsActive(true);
    setIsFeatured(false);
    setFormOpen(true);
  }

  function openEdit(p: AdminProductRow) {
    setEditing(p);
    setPreview(p.image);
    setIsActive(p.isActive);
    setIsFeatured(p.isFeatured);
    setFormOpen(true);
  }

  function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  function submit() {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    fd.set('isActive', String(isActive));
    fd.set('isFeatured', String(isFeatured));

    if (!String(fd.get('name') ?? '').trim()) {
      toast.error('Product name is required.');
      return;
    }

    startTransition(async () => {
      const res = editing ? await updateProduct(editing.id, fd) : await createProduct(fd);
      if (res.ok) {
        toast.success(editing ? 'Product updated.' : 'Product created.');
        setFormOpen(false);
      } else {
        toast.error(res.error ?? 'Could not save.');
      }
    });
  }

  function confirmDelete() {
    if (!toDelete) return;
    startTransition(async () => {
      const res = await deleteProduct(toDelete.id);
      if (res.ok) {
        toast.success('Product deleted.');
        setToDelete(null);
      } else {
        toast.error(res.error ?? 'Could not delete.');
      }
    });
  }

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`${products.length} products in your catalog`}
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
        <div className="border-b border-slate-100 p-[16px]">
          <div className="relative max-w-[360px]">
            <Search className="pointer-events-none absolute left-[14px] top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or category…"
              className="h-[42px] w-full rounded-[10px] border border-slate-200 bg-slate-50 pl-[42px] pr-[14px] text-[14px] focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[12px] uppercase tracking-wide text-slate-400">
                <th className="px-[20px] py-[12px] font-medium">Product</th>
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
                        <p className="text-[12px] text-slate-400">
                          {p.categoryName} · {p.variantCount} variant{p.variantCount === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-[20px] py-[12px]">
                    <span className={p.stock === 0 ? 'font-medium text-red-500' : 'text-slate-700'}>
                      {p.stock === 0 ? 'Out of stock' : p.stock}
                    </span>
                  </td>
                  <td className="px-[20px] py-[12px] font-medium text-slate-900">{formatPrice(p.price)}</td>
                  <td className="px-[20px] py-[12px]">
                    <span
                      className={`inline-flex items-center rounded-full px-[10px] py-[3px] text-[12px] font-medium ring-1 ring-inset ${
                        p.isActive
                          ? 'bg-emerald-50 text-emerald-600 ring-emerald-200'
                          : 'bg-slate-100 text-slate-500 ring-slate-200'
                      }`}
                    >
                      {p.isActive ? 'Published' : 'Draft'}
                    </span>
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
                  <td colSpan={5} className="px-[20px] py-[48px] text-center text-[14px] text-slate-400">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Product' : 'Add Product'} size="lg">
        <form ref={formRef} className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
          {/* Image */}
          <div className="sm:col-span-2">
            <span className={labelCls}>Product image</span>
            <div className="flex items-center gap-[16px]">
              <div className="size-[88px] shrink-0 overflow-hidden rounded-[10px] border border-dashed border-slate-300 bg-slate-50">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="preview" className="size-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-[11px] text-slate-400">No image</span>
                )}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-[8px] rounded-[10px] border border-slate-200 px-[14px] py-[10px] text-[13px] font-medium text-slate-600 hover:bg-slate-50">
                <Upload className="size-[16px]" /> {editing ? 'Replace image' : 'Upload'}
                <input type="file" name="image" accept="image/jpeg,image/png,image/webp" onChange={onImage} className="hidden" />
              </label>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Name</label>
            <input name="name" className={inputCls} defaultValue={editing?.name ?? ''} placeholder="e.g. Embroidered Lawn Suit" />
          </div>

          <div>
            <label className={labelCls}>Category</label>
            <select name="categoryId" className={inputCls} defaultValue={editing?.categoryId ?? categories[0]?.id ?? ''}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Department</label>
            <select name="gender" className={inputCls} defaultValue={editing?.gender ?? 'WOMEN'}>
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g.charAt(0) + g.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Price (PKR)</label>
            <input type="number" name="price" min={0} className={inputCls} defaultValue={editing ? Math.round(editing.price / 100) : 0} />
          </div>

          <div>
            <label className={labelCls}>Visibility</label>
            <div className="flex gap-[10px]">
              {([['Published', true], ['Draft', false]] as const).map(([label, val]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setIsActive(val)}
                  className={`h-[42px] flex-1 rounded-[10px] border text-[14px] font-medium transition-colors ${
                    isActive === val ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Description</label>
            <textarea name="description" rows={3} className={`${inputCls} h-auto py-[10px]`} defaultValue={editing?.description ?? ''} placeholder="Short product description…" />
          </div>

          <label className="flex cursor-pointer items-center gap-[10px] sm:col-span-2">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="size-[18px] rounded border-slate-300 text-indigo-600 focus:ring-indigo-400" />
            <span className="text-[14px] text-slate-600">Feature on the homepage</span>
          </label>

          {!editing && (
            <p className="sm:col-span-2 rounded-[10px] bg-amber-50 px-[14px] py-[10px] text-[12px] text-amber-700">
              A default size/color variant (with stock 25) is created so the product is immediately buyable.
              Manage detailed variants from the product page later.
            </p>
          )}
        </form>

        <div className="mt-[24px] flex justify-end gap-[10px]">
          <button type="button" onClick={() => setFormOpen(false)} className="h-[42px] rounded-[10px] border border-slate-200 px-[18px] text-[14px] font-medium text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={pending} className="h-[42px] rounded-[10px] bg-indigo-600 px-[20px] text-[14px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
            {pending ? 'Saving…' : editing ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete product" size="sm">
        <p className="text-[14px] text-slate-600">
          Delete <span className="font-semibold text-slate-900">{toDelete?.name}</span>? This cannot be undone.
          Products in past orders can&apos;t be deleted — set them to Draft instead.
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
