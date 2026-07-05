'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Plus, Pencil, Trash2, Search, Upload, X } from 'lucide-react';
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
  images: { id: string; url: string }[];
  categoryId: string;
  categoryName: string;
  subCategoryId: string | null;
  subCategoryName: string | null;
  fabric: string | null;
  careInstructions: string | null;
  season: string | null;
  gender: string;
  price: number; // paisa
  stock: number; // summed across variants
  variantCount: number;
  variants: { id: string; size: string; color: string; sku: string | null; stock: number }[];
  isActive: boolean;
  isFeatured: boolean;
}

export interface CategoryOption {
  id: string;
  name: string;
  gender: string;
  subCategories: { id: string; name: string }[];
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
  subCategoryId: string;
  fabric: string;
  careInstructions: string;
  season: string;
  gender: string;
  price: string;
  description: string;
  isActive: boolean;
  isFeatured: boolean;
  variants: { size: string; color: string; stock: number; sku?: string }[];
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
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Controlled dropdown states for Department -> Category -> Subcategory linking
  const [selectedGender, setSelectedGender] = useState('WOMEN');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');

  // Multiple Images State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

  // Variants State
  const [variants, setVariants] = useState<{ size: string; color: string; stock: number; sku?: string }[]>([]);

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
   */
  function persistDraft(
    overrides?: Partial<Pick<ProductDraft, 'isActive' | 'isFeatured' | 'categoryId' | 'subCategoryId' | 'gender' | 'variants'>>
  ) {
    if (editing) return;
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    saveDraft({
      name: String(fd.get('name') ?? ''),
      categoryId: overrides?.categoryId ?? String(fd.get('categoryId') ?? ''),
      subCategoryId: overrides?.subCategoryId ?? String(fd.get('subCategoryId') ?? ''),
      fabric: String(fd.get('fabric') ?? ''),
      careInstructions: String(fd.get('careInstructions') ?? ''),
      season: String(fd.get('season') ?? ''),
      gender: overrides?.gender ?? String(fd.get('gender') ?? ''),
      price: String(fd.get('price') ?? ''),
      description: String(fd.get('description') ?? ''),
      isActive: overrides?.isActive ?? isActive,
      isFeatured: overrides?.isFeatured ?? isFeatured,
      variants: overrides?.variants ?? variants,
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
    setIsActive(true);
    setIsFeatured(false);

    // Reset dropdown states to default
    const initialGender = 'WOMEN';
    const activeCategories = categories.filter((c) => c.gender === initialGender);
    const initialCategory = activeCategories[0]?.id ?? '';
    const activeCategoryObj = activeCategories[0];
    const initialSubCategory = activeCategoryObj?.subCategories[0]?.id ?? '';

    setSelectedGender(initialGender);
    setSelectedCategory(initialCategory);
    setSelectedSubCategory(initialSubCategory);

    // Clear images state
    setSelectedFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setDeletedImageIds([]);

    // Clear variants state
    setVariants([{ size: 'One Size', color: 'Default', stock: 25, sku: '' }]);

    setFormOpen(true);
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(search.toLowerCase()) ||
      (p.subCategoryName && p.subCategoryName.toLowerCase().includes(search.toLowerCase())) ||
      (p.fabric && p.fabric.toLowerCase().includes(search.toLowerCase())) ||
      (p.season && p.season.toLowerCase().includes(search.toLowerCase())),
  );

  function openAdd() {
    const saved = loadDraft();
    const savedImage = loadDraftImage();
    setEditing(null);
    setImageTooLarge(false);
    
    // Clear dynamic states
    setSelectedFiles([]);
    setExistingImages([]);
    setDeletedImageIds([]);

    if (savedImage) {
      setImagePreviews([savedImage.dataUrl]);
      restoredImageRef.current = dataUrlToFile(savedImage);
    } else {
      setImagePreviews([]);
      restoredImageRef.current = null;
    }

    setDraft(saved);
    setHasDraft(saved !== null || savedImage !== null);
    setIsActive(saved?.isActive ?? true);
    setIsFeatured(saved?.isFeatured ?? false);

    // Set initial values for dropdowns based on draft
    const initialGender = saved?.gender ?? 'WOMEN';
    const activeCategories = categories.filter((c) => c.gender === initialGender);
    const initialCategory = saved?.categoryId ?? activeCategories[0]?.id ?? '';
    const activeCategoryObj = categories.find((c) => c.id === initialCategory);
    const initialSubCategory = saved?.subCategoryId ?? activeCategoryObj?.subCategories[0]?.id ?? '';

    setSelectedGender(initialGender);
    setSelectedCategory(initialCategory);
    setSelectedSubCategory(initialSubCategory);

    // Set initial variants from draft
    setVariants(saved?.variants ?? [{ size: 'One Size', color: 'Default', stock: 25, sku: '' }]);

    setFormOpen(true);
  }

  function openEdit(p: AdminProductRow) {
    setEditing(p);
    setDraft(null); // editing loads real DB values, never the Add draft
    setImageTooLarge(false);
    restoredImageRef.current = null;

    // Load existing images
    setExistingImages(p.images);
    setDeletedImageIds([]);
    setSelectedFiles([]);
    setImagePreviews([]);

    setIsActive(p.isActive);
    setIsFeatured(p.isFeatured);

    // Set dropdown states from the product row
    setSelectedGender(p.gender);
    setSelectedCategory(p.categoryId);
    setSelectedSubCategory(p.subCategoryId ?? '');

    // Set variants from product
    setVariants(p.variants.map((v) => ({ size: v.size, color: v.color, stock: v.stock, sku: v.sku ?? '' })));

    setFormOpen(true);
  }

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setSelectedFiles((prev) => [...prev, ...newFiles]);

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    // Drop draft image reference since user chose files
    restoredImageRef.current = null;

    if (editing) return;

    // Handle draft storage for first file (single file fallback for draft)
    const firstFile = newFiles[0];
    if (firstFile) {
      if (firstFile.size > MAX_DRAFT_IMAGE_BYTES) {
        clearDraftImage();
        setImageTooLarge(true);
        return;
      }
      setImageTooLarge(false);
      fileToDataUrl(firstFile)
        .then((dataUrl) => {
          const ok = saveDraftImage({ dataUrl, name: firstFile.name, type: firstFile.type });
          if (!ok) setImageTooLarge(true);
        })
        .catch(() => setImageTooLarge(true));
    }
  }

  function removeNewImage(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    if (!editing) {
      persistDraft();
    }
  }

  function removeExistingImage(id: string) {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
    setDeletedImageIds((prev) => [...prev, id]);
  }

  // Variant editing handlers
  function addVariantRow() {
    setVariants((prev) => {
      const next = [...prev, { size: 'M', color: 'Default', stock: 10, sku: '' }];
      persistDraft({ variants: next });
      return next;
    });
  }

  function removeVariantRow(index: number) {
    setVariants((prev) => {
      const next = prev.filter((_, i) => i !== index);
      persistDraft({ variants: next });
      return next;
    });
  }

  function updateVariantRow(index: number, field: 'size' | 'color' | 'stock' | 'sku', value: any) {
    setVariants((prev) => {
      const next = prev.map((v, i) => (i === index ? { ...v, [field]: value } : v));
      persistDraft({ variants: next });
      return next;
    });
  }

  function submit() {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    fd.set('isActive', String(isActive));
    fd.set('isFeatured', String(isFeatured));

    // Clear file field to manually append correct selected files
    fd.delete('image');
    selectedFiles.forEach((file) => {
      fd.append('image', file);
    });

    // If edit mode, pass list of deleted images
    if (editing) {
      fd.set('deletedImageIds', deletedImageIds.join(','));
    } else if (selectedFiles.length === 0 && restoredImageRef.current) {
      // In Add mode, if no files selected but we had a restored file, inject it
      fd.append('image', restoredImageRef.current);
    }

    // Set serialized variants
    fd.set('variants', JSON.stringify(variants));

    if (!String(fd.get('name') ?? '').trim()) {
      toast.error('Product name is required.');
      return;
    }

    startTransition(async () => {
      const res = editing ? await updateProduct(editing.id, fd) : await createProduct(fd);
      if (res.ok) {
        toast.success(editing ? 'Product updated.' : 'Product created.');
        if (!editing) {
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
                <p className="text-[11px] text-slate-400">
                  {p.categoryName}
                  {p.subCategoryName ? ` → ${p.subCategoryName}` : ''} · {formatPrice(p.price)}
                </p>
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
                          {p.categoryName}
                          {p.subCategoryName ? ` → ${p.subCategoryName}` : ''} · {p.variantCount} variant{p.variantCount === 1 ? '' : 's'}
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
          {/* Multiple Image Upload Manager */}
          <div className="sm:col-span-2">
            <span className={labelCls}>Product Images</span>
            <div className="flex flex-wrap gap-3 items-center">
              {/* Existing Images */}
              {existingImages.map((img) => (
                <div key={img.id} className="group relative size-[88px] overflow-hidden rounded-[10px] border border-slate-200 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="product" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img.id)}
                    className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-red-600 text-white opacity-0 transition-opacity hover:bg-red-700 group-hover:opacity-100"
                    title="Delete image"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}

              {/* Newly Selected Images */}
              {imagePreviews.map((url, idx) => (
                <div key={idx} className="group relative size-[88px] overflow-hidden rounded-[10px] border border-slate-200 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="preview" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-red-600 text-white opacity-0 transition-opacity hover:bg-red-700 group-hover:opacity-100"
                    title="Remove image"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}

              {/* Upload Button */}
              <label className="flex size-[88px] cursor-pointer flex-col items-center justify-center rounded-[10px] border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors">
                <Upload className="size-[20px] text-slate-400 mb-1" />
                <span className="text-[11px] font-medium text-slate-500">Add Images</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={onImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Name</label>
            <input name="name" className={inputCls} defaultValue={editing?.name ?? draft?.name ?? ''} placeholder="e.g. Embroidered Lawn Suit" />
          </div>

          <div>
            <label className={labelCls}>Department</label>
            <select
              name="gender"
              className={inputCls}
              value={selectedGender}
              onChange={(e) => {
                const nextGender = e.target.value;
                setSelectedGender(nextGender);
                const filteredCats = categories.filter((c) => c.gender === nextGender);
                const nextCat = filteredCats[0]?.id ?? '';
                setSelectedCategory(nextCat);
                const nextCatObj = filteredCats[0];
                const nextSub = nextCatObj?.subCategories[0]?.id ?? '';
                setSelectedSubCategory(nextSub);
                persistDraft({ gender: nextGender, categoryId: nextCat, subCategoryId: nextSub });
              }}
            >
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g.charAt(0) + g.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Category</label>
            <select
              name="categoryId"
              className={inputCls}
              value={selectedCategory}
              onChange={(e) => {
                const nextCat = e.target.value;
                setSelectedCategory(nextCat);
                const catObj = categories.find((c) => c.id === nextCat);
                const nextSub = catObj?.subCategories[0]?.id ?? '';
                setSelectedSubCategory(nextSub);
                persistDraft({ categoryId: nextCat, subCategoryId: nextSub });
              }}
            >
              {categories
                .filter((c) => c.gender === selectedGender)
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              {categories.filter((c) => c.gender === selectedGender).length === 0 && (
                <option value="">No categories available</option>
              )}
            </select>
          </div>

          <div>
            <label className={labelCls}>Sub-category</label>
            <select
              name="subCategoryId"
              className={inputCls}
              value={selectedSubCategory}
              onChange={(e) => {
                const nextSub = e.target.value;
                setSelectedSubCategory(nextSub);
                persistDraft({ subCategoryId: nextSub });
              }}
            >
              <option value="">None (Plain Category)</option>
              {categories
                .find((c) => c.id === selectedCategory)
                ?.subCategories.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Price (PKR)</label>
            <input type="number" name="price" min={0} className={inputCls} defaultValue={editing ? Math.round(editing.price / 100) : (draft?.price ?? 0)} />
          </div>

          <div>
            <label className={labelCls}>Fabric / Material</label>
            <input
              name="fabric"
              className={inputCls}
              defaultValue={editing?.fabric ?? draft?.fabric ?? ''}
              placeholder="e.g. Lawn, Cotton Silk, Velvet"
            />
          </div>

          <div>
            <label className={labelCls}>Season / Collection</label>
            <input
              name="season"
              className={inputCls}
              defaultValue={editing?.season ?? draft?.season ?? ''}
              placeholder="e.g. Summer '26, Eid Festive"
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Care Instructions</label>
            <textarea
              name="careInstructions"
              rows={2}
              className={`${inputCls} h-auto py-[10px]`}
              defaultValue={editing?.careInstructions ?? draft?.careInstructions ?? ''}
              placeholder="e.g. Dry clean only. Wash separately in cold water. Do not bleach."
            />
          </div>

          <div className="sm:col-span-2">
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

          {/* Dynamic Variant Builder */}
          <div className="sm:col-span-2 border-t border-slate-100 pt-[18px]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="block text-[14px] font-semibold text-slate-900">Product Variants</span>
                <span className="text-[12px] text-slate-400">Add size, color, stock, and SKU overrides for this clothing item.</span>
              </div>
              <button
                type="button"
                onClick={addVariantRow}
                className="inline-flex h-[32px] items-center gap-[6px] rounded-[6px] bg-slate-100 hover:bg-slate-200 px-[10px] text-[12px] font-semibold text-slate-700 transition-colors"
              >
                <Plus className="size-[14px]" /> Add Variant
              </button>
            </div>

            <div className="overflow-x-auto rounded-[8px] border border-slate-100 bg-slate-50/50 p-2">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="text-slate-400 font-medium border-b border-slate-100 text-[11px] uppercase tracking-wider">
                    <th className="px-2 py-2">Size</th>
                    <th className="px-2 py-2">Color</th>
                    <th className="px-2 py-2">Stock</th>
                    <th className="px-2 py-2">SKU (Optional)</th>
                    <th className="px-2 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {variants.map((v, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40">
                      <td className="px-2 py-1.5 min-w-[80px]">
                        <input
                          type="text"
                          value={v.size}
                          onChange={(e) => updateVariantRow(idx, 'size', e.target.value)}
                          className="h-[32px] w-full rounded-[6px] border border-slate-200 bg-white px-2 text-[13px] focus:border-indigo-400 focus:outline-none"
                          placeholder="e.g. S, M, L, XL"
                        />
                      </td>
                      <td className="px-2 py-1.5 min-w-[100px]">
                        <input
                          type="text"
                          value={v.color}
                          onChange={(e) => updateVariantRow(idx, 'color', e.target.value)}
                          className="h-[32px] w-full rounded-[6px] border border-slate-200 bg-white px-2 text-[13px] focus:border-indigo-400 focus:outline-none"
                          placeholder="e.g. Black, Navy, Off-white"
                        />
                      </td>
                      <td className="px-2 py-1.5 min-w-[70px]">
                        <input
                          type="number"
                          min={0}
                          value={v.stock}
                          onChange={(e) => updateVariantRow(idx, 'stock', parseInt(e.target.value) || 0)}
                          className="h-[32px] w-full rounded-[6px] border border-slate-200 bg-white px-2 text-[13px] focus:border-indigo-400 focus:outline-none"
                          placeholder="Stock"
                        />
                      </td>
                      <td className="px-2 py-1.5 min-w-[120px]">
                        <input
                          type="text"
                          value={v.sku || ''}
                          onChange={(e) => updateVariantRow(idx, 'sku', e.target.value)}
                          className="h-[32px] w-full rounded-[6px] border border-slate-200 bg-white px-2 text-[13px] focus:border-indigo-400 focus:outline-none"
                          placeholder="Auto-generated if empty"
                        />
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        <button
                          type="button"
                          onClick={() => removeVariantRow(idx)}
                          className="inline-flex size-7 items-center justify-center rounded-[6px] border border-slate-200 bg-white text-slate-400 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                          <Trash2 className="size-[14px]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {variants.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 text-[12px]">
                        No variants added. The product needs at least one variant to be purchasable.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
