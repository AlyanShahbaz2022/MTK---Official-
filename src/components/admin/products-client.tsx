'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Plus, Pencil, Trash2, Search, Upload } from 'lucide-react';
import { Card, PageHeader } from '@/components/admin/ui';
import { Modal } from '@/components/admin/modal';
import { toast } from '@/store/admin-toast';
import { createProduct, updateProduct, deleteProduct, deleteProductsBulk } from '@/server/actions/admin-products';
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

// --- Auto-saved draft for the "Add Product" form -------------------------
// Persists what's typed (not the image file — browsers can't restore those)
// so an accidental close/refresh doesn't lose the work. Cleared on create.
const DRAFT_KEY = 'mtk:admin:product-draft';
// Image is stored under its own key so an oversized image can never corrupt or
// evict the (small, always-safe) text draft. localStorage ~5MB cap per origin.
const IMAGE_KEY = 'mtk:admin:product-draft-image';
const MAX_DRAFT_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB before base64 inflation

interface ProductDraft {
  name: string;
  categoryId: string;
  gender: string;
  price: string;
  description: string;
  isActive: boolean;
  isFeatured: boolean;
}

interface DraftImage {
  dataUrl: string; // base64 data: URL
  name: string;
  type: string;
}

/** Read a File as a base64 data URL. */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Rebuild a File from a stored base64 data URL (so Create can upload it). */
function dataUrlToFile(img: DraftImage): File | null {
  try {
    const [meta, b64] = img.dataUrl.split(',');
    if (!meta || !b64) return null;
    const mime = meta.match(/:(.*?);/)?.[1] ?? img.type ?? 'image/jpeg';
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new File([bytes], img.name || 'image', { type: mime });
  } catch {
    return null;
  }
}

function loadDraftImage(): DraftImage | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(IMAGE_KEY);
    return raw ? (JSON.parse(raw) as DraftImage) : null;
  } catch {
    return null;
  }
}

/** Persist the image draft. Returns false if it was too large / failed. */
function saveDraftImage(img: DraftImage): boolean {
  try {
    window.localStorage.setItem(IMAGE_KEY, JSON.stringify(img));
    return true;
  } catch {
    // Quota exceeded — drop it so the text draft stays intact.
    try { window.localStorage.removeItem(IMAGE_KEY); } catch { /* ignore */ }
    return false;
  }
}

function clearDraftImage() {
  try {
    window.localStorage.removeItem(IMAGE_KEY);
  } catch {
    /* ignore */
  }
}

function loadDraft(): ProductDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as ProductDraft) : null;
  } catch {
    return null;
  }
}

function saveDraft(draft: ProductDraft) {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* storage full / unavailable — ignore */
  }
}

function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  // Initial values for the Add form's uncontrolled inputs (from a saved draft).
  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [imageTooLarge, setImageTooLarge] = useState(false);
  // A File rebuilt from the saved draft image, used at submit if the user
  // didn't pick a new file. Cleared once they choose their own.
  const restoredImageRef = useRef<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  // On mount, note whether a saved draft exists (drives the "restored" hint).
  useEffect(() => {
    setHasDraft(loadDraft() !== null);
  }, []);

  /**
   * Snapshot the current Add-form values to localStorage (Add mode only).
   * Toggle state (isActive/isFeatured) lives in React state, so callers that
   * just changed it pass the new value in to avoid a stale-closure read.
   */
  function persistDraft(overrides?: Partial<Pick<ProductDraft, 'isActive' | 'isFeatured'>>) {
    if (editing) return;
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    saveDraft({
      name: String(fd.get('name') ?? ''),
      categoryId: String(fd.get('categoryId') ?? ''),
      gender: String(fd.get('gender') ?? ''),
      price: String(fd.get('price') ?? ''),
      description: String(fd.get('description') ?? ''),
      isActive: overrides?.isActive ?? isActive,
      isFeatured: overrides?.isFeatured ?? isFeatured,
    });
    setHasDraft(true);
  }

  function discardDraft() {
    clearDraft();
    clearDraftImage();
    restoredImageRef.current = null;
    setImageTooLarge(false);
    setDraft(null);
    setHasDraft(false);
    setEditing(null);
    setPreview(null);
    setIsActive(true);
    setIsFeatured(false);
    setFormOpen(true);
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(search.toLowerCase()),
  );

  function openAdd() {
    const saved = loadDraft();
    const savedImage = loadDraftImage();
    setEditing(null);
    setImageTooLarge(false);
    // Restore the image preview + rebuild a File for submit, if one was saved.
    if (savedImage) {
      setPreview(savedImage.dataUrl);
      restoredImageRef.current = dataUrlToFile(savedImage);
    } else {
      setPreview(null);
      restoredImageRef.current = null;
    }
    setDraft(saved);
    setHasDraft(saved !== null || savedImage !== null);
    setIsActive(saved?.isActive ?? true);
    setIsFeatured(saved?.isFeatured ?? false);
    setFormOpen(true);
  }

  function openEdit(p: AdminProductRow) {
    setEditing(p);
    setDraft(null); // editing loads real DB values, never the Add draft
    setImageTooLarge(false);
    restoredImageRef.current = null;
    setPreview(p.image);
    setIsActive(p.isActive);
    setIsFeatured(p.isFeatured);
    setFormOpen(true);
  }

  function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    // The user picked a real file — it'll be in the form, so drop the restored one.
    restoredImageRef.current = null;

    if (editing) return; // only Add-mode drafts are auto-saved

    if (file.size > MAX_DRAFT_IMAGE_BYTES) {
      // Too big to persist safely — keep it for THIS session (it's in the input),
      // but don't store it, and warn that it won't survive a refresh.
      clearDraftImage();
      setImageTooLarge(true);
      return;
    }
    setImageTooLarge(false);
    fileToDataUrl(file)
      .then((dataUrl) => {
        const ok = saveDraftImage({ dataUrl, name: file.name, type: file.type });
        if (!ok) setImageTooLarge(true);
      })
      .catch(() => setImageTooLarge(true));
  }

  function submit() {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    fd.set('isActive', String(isActive));
    fd.set('isFeatured', String(isFeatured));

    // If the image came from a restored draft (user didn't re-pick), the file
    // input is empty — inject the rebuilt File so it still uploads.
    const picked = fd.get('image');
    const hasPicked = picked instanceof File && picked.size > 0;
    if (!hasPicked && restoredImageRef.current) {
      fd.set('image', restoredImageRef.current);
    }

    if (!String(fd.get('name') ?? '').trim()) {
      toast.error('Product name is required.');
      return;
    }

    startTransition(async () => {
      const res = editing ? await updateProduct(editing.id, fd) : await createProduct(fd);
      if (res.ok) {
        toast.success(editing ? 'Product updated.' : 'Product created.');
        if (!editing) {
          // Product saved for real — the auto-saved draft is no longer needed.
          clearDraft();
          clearDraftImage();
          restoredImageRef.current = null;
          setImageTooLarge(false);
          setHasDraft(false);
          setDraft(null);
        }
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
        setSelected(prev => { const n = new Set(prev); n.delete(toDelete.id); return n; });
      } else {
        toast.error(res.error ?? 'Could not delete.');
      }
    });
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length && filtered.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(p => p.id)));
    }
  }

  function confirmBulkDelete() {
    startTransition(async () => {
      const res = await deleteProductsBulk(Array.from(selected));
      if (res.ok) {
        const msg = res.skipped > 0
          ? `Deleted ${res.deleted} product${res.deleted !== 1 ? 's' : ''}. ${res.skipped} skipped (in orders).`
          : `Deleted ${res.deleted} product${res.deleted !== 1 ? 's' : ''}.`;
        toast.success(msg);
        setSelected(new Set());
        setBulkDeleteOpen(false);
      } else {
        toast.error(res.error ?? 'Could not delete.');
      }
    });
  }

  return (
    <>
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-[14px] bg-slate-900 px-5 py-3 shadow-2xl">
            <span className="text-[13px] font-semibold text-white">{selected.size} product{selected.size !== 1 ? 's' : ''} selected</span>
            <div className="h-4 w-px bg-white/20" />
            <button type="button" onClick={() => setSelected(new Set())} className="text-[12px] text-slate-400 hover:text-white">Clear</button>
            <button type="button" onClick={() => setBulkDeleteOpen(true)}
              className="flex items-center gap-2 rounded-[8px] bg-red-500 px-4 py-1.5 text-[13px] font-bold text-white hover:bg-red-600">
              <Trash2 style={{ width: 14, height: 14 }} /> Delete Selected
            </button>
          </div>
        </div>
      )}
      <PageHeader
        title="Products"
        subtitle={`${products.length} products in your catalog`}
        action={
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex h-[40px] sm:h-[42px] items-center gap-[8px] rounded-[10px] bg-indigo-600 px-[14px] sm:px-[18px] text-[13px] sm:text-[14px] font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            <Plus className="size-[16px] sm:size-[18px]" /> Add Product
          </button>
        }
      />

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 p-[12px] sm:p-[16px]">
          <div className="flex items-center gap-3">
            {/* Select All checkbox */}
            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-slate-500">
              <input
                type="checkbox"
                checked={filtered.length > 0 && selected.size === filtered.length}
                ref={el => { if (el) el.indeterminate = selected.size > 0 && selected.size < filtered.length; }}
                onChange={toggleSelectAll}
                className="size-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
              />
              <span className="hidden sm:inline">Select all</span>
            </label>
            <div className="relative flex-1 sm:max-w-[360px]">
              <Search className="pointer-events-none absolute left-[14px] top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or category…"
                className="h-[42px] w-full rounded-[10px] border border-slate-200 bg-slate-50 pl-[42px] pr-[14px] text-[14px] focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-slate-50 sm:hidden">
          {filtered.map((p) => (
            <div key={p.id} className={`flex items-center gap-[12px] px-[12px] py-[10px] transition-colors ${selected.has(p.id) ? 'bg-indigo-50' : ''}`}>
              <input
                type="checkbox"
                checked={selected.has(p.id)}
                onChange={() => toggleSelect(p.id)}
                className="size-4 shrink-0 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
              />
              <div className="size-[48px] shrink-0 overflow-hidden rounded-[8px] bg-slate-100">
                {p.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt={p.name} className="size-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-slate-900">{p.name}</p>
                <p className="text-[11px] text-slate-400">{p.categoryName} · {formatPrice(p.price)}</p>
                <span className={`mt-1 inline-flex items-center rounded-full px-[8px] py-[2px] text-[10px] font-medium ring-1 ring-inset ${
                  p.isActive ? 'bg-emerald-50 text-emerald-600 ring-emerald-200' : 'bg-slate-100 text-slate-500 ring-slate-200'
                }`}>{p.isActive ? 'Published' : 'Draft'}</span>
              </div>
              <div className="flex shrink-0 gap-[4px]">
                <button type="button" onClick={() => openEdit(p)} aria-label="Edit"
                  className="flex items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-500 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                  style={{ width: 32, height: 32 }}>
                  <Pencil style={{ width: 14, height: 14 }} />
                </button>
                <button type="button" onClick={() => setToDelete(p)} aria-label="Delete"
                  className="flex items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-500 shadow-sm hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                  style={{ width: 32, height: 32 }}>
                  <Trash2 style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="px-[12px] py-[40px] text-center text-[14px] text-slate-400">No products found.</p>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[12px] uppercase tracking-wide text-slate-400">
                <th className="px-[16px] py-[12px]">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selected.size === filtered.length}
                    onChange={toggleSelectAll}
                    className="size-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
                  />
                </th>
                <th className="px-[20px] py-[12px] font-medium">Product</th>
                <th className="px-[20px] py-[12px] font-medium">Stock</th>
                <th className="px-[20px] py-[12px] font-medium">Price</th>
                <th className="px-[20px] py-[12px] font-medium">Status</th>
                <th className="px-[20px] py-[12px] text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className={`border-b border-slate-50 text-[14px] last:border-0 transition-colors ${selected.has(p.id) ? 'bg-indigo-50' : 'hover:bg-slate-50/60'}`}>
                  <td className="px-[16px] py-[12px]">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      className="size-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
                    />
                  </td>
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
                        className="flex items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-500 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                        style={{ width: 34, height: 34 }}
                      >
                        <Pencil style={{ width: 15, height: 15 }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setToDelete(p)}
                        aria-label="Delete"
                        className="flex items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-500 shadow-sm hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                        style={{ width: 34, height: 34 }}
                      >
                        <Trash2 style={{ width: 15, height: 15 }} />
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
        {!editing && hasDraft && (
          <div className="mb-[18px] flex items-center justify-between gap-[12px] rounded-[10px] bg-indigo-50 px-[14px] py-[10px] text-[12px] text-indigo-700">
            <span>Restored your unsaved draft.</span>
            <button
              type="button"
              onClick={discardDraft}
              className="shrink-0 font-semibold text-indigo-600 underline-offset-2 hover:underline"
            >
              Discard draft
            </button>
          </div>
        )}
        {!editing && imageTooLarge && (
          <div className="mb-[18px] rounded-[10px] bg-amber-50 px-[14px] py-[10px] text-[12px] text-amber-700">
            This image is larger than 2&nbsp;MB, so it won&apos;t be saved to the draft.
            It still uploads if you create the product now, but won&apos;t survive a refresh.
          </div>
        )}
        <form
          key={editing ? `edit-${editing.id}` : `add-${draft ? 'draft' : 'blank'}`}
          ref={formRef}
          onInput={() => persistDraft()}
          className="grid grid-cols-1 gap-[18px] sm:grid-cols-2"
        >
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
            <input name="name" className={inputCls} defaultValue={editing?.name ?? draft?.name ?? ''} placeholder="e.g. Embroidered Lawn Suit" />
          </div>

          <div>
            <label className={labelCls}>Category</label>
            <select name="categoryId" className={inputCls} defaultValue={editing?.categoryId ?? draft?.categoryId ?? categories[0]?.id ?? ''}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Department</label>
            <select name="gender" className={inputCls} defaultValue={editing?.gender ?? draft?.gender ?? 'WOMEN'}>
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g.charAt(0) + g.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Price (PKR)</label>
            <input type="number" name="price" min={0} className={inputCls} defaultValue={editing ? Math.round(editing.price / 100) : (draft?.price ?? 0)} />
          </div>

          <div>
            <label className={labelCls}>Visibility</label>
            <div className="flex gap-[10px]">
              {([['Published', true], ['Draft', false]] as const).map(([label, val]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => { setIsActive(val); persistDraft({ isActive: val }); }}
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
            <textarea name="description" rows={3} className={`${inputCls} h-auto py-[10px]`} defaultValue={editing?.description ?? draft?.description ?? ''} placeholder="Short product description…" />
          </div>

          <label className="flex cursor-pointer items-center gap-[10px] sm:col-span-2">
            <input type="checkbox" checked={isFeatured} onChange={(e) => { setIsFeatured(e.target.checked); persistDraft({ isFeatured: e.target.checked }); }} className="size-[18px] rounded border-slate-300 text-indigo-600 focus:ring-indigo-400" />
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
      {/* Bulk delete confirm */}
      <Modal open={bulkDeleteOpen} onClose={() => setBulkDeleteOpen(false)} title="Delete selected products" size="sm">
        <p className="text-[14px] text-slate-600">
          Delete <span className="font-semibold text-slate-900">{selected.size} product{selected.size !== 1 ? 's' : ''}</span>?
          Products that appear in past orders will be skipped automatically.
        </p>
        <div className="mt-[24px] flex justify-end gap-[10px]">
          <button type="button" onClick={() => setBulkDeleteOpen(false)} className="h-[42px] rounded-[10px] border border-slate-200 px-[18px] text-[14px] font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="button" onClick={confirmBulkDelete} disabled={pending} className="h-[42px] rounded-[10px] bg-red-600 px-[20px] text-[14px] font-semibold text-white hover:bg-red-700 disabled:opacity-50">
            {pending ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </Modal>
    </>
  );
}
