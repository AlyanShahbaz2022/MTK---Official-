'use client';

import { useRef, useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload, X, GripVertical, Image as ImageIcon, Video,
  Bold, Italic, Underline, List, ListOrdered, Link2, Heading2,
  Package, DollarSign, Info, Camera, FileText, Search as SearchIcon,
  Truck, ToggleLeft, ArrowLeft, Save, Send,
} from 'lucide-react';
import { Card } from '@/components/admin/ui';
import { toast } from '@/store/admin-toast';
import { createProduct } from '@/server/actions/admin-products';
import { GENDERS } from '@/schemas/admin';

/* ── Types ────────────────────────────────────────────────────────── */
export interface CategoryOption {
  id: string;
  name: string;
  gender: string;
  subCategories: { id: string; name: string }[];
}

/* ── Constants ────────────────────────────────────────────────────── */
const PRODUCT_TYPES = [
  'T-Shirt', 'Shirt', 'Polo', 'Hoodie', 'Sweatshirt', 'Jacket',
  'Jeans', 'Pants', 'Shorts', 'Kurta', 'Shalwar Kameez', 'Tracksuit', 'Accessories',
];
const FITS = ['Slim', 'Regular', 'Relaxed', 'Oversized'];
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL',
  '28', '30', '32', '34', '36', '38', '40', '42', '44',
  'Free Size', 'One Size'];
const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter', 'All Season'];
const BRANDS = ['MTK', 'MTK Premium', 'MTK Kids', 'MTK Sport'];

const inputCls =
  'h-[42px] w-full rounded-[10px] border border-slate-200 bg-white px-[14px] text-[14px] text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors';
const labelCls = 'mb-[6px] block text-[13px] font-medium text-slate-600';
const sectionTitleCls = 'flex items-center gap-3 text-[16px] font-bold text-slate-900';
const sectionSubCls = 'mt-1 text-[13px] text-slate-400';

/* ── Helpers ──────────────────────────────────────────────────────── */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/* ── Component ────────────────────────────────────────────────────── */
export function AddProductForm({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  // Dropdown state
  const [selectedGender, setSelectedGender] = useState('MEN');
  const [selectedCategory, setSelectedCategory] = useState(
    () => categories.filter((c) => c.gender === 'MEN')[0]?.id ?? '',
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState('');

  // Images
  const [images, setImages] = useState<{ file: File; preview: string; id: string }[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  // Sizes multi-select
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // Status toggles
  const [published, setPublished] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [newArrival, setNewArrival] = useState(false);
  const [bestSeller, setBestSeller] = useState(false);
  const [onSale, setOnSale] = useState(false);

  /* ── Image handlers ──────────────────────────────────────────────── */
  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    const valid = arr.filter((f) => {
      if (!ALLOWED_TYPES.includes(f.type)) {
        toast.error(`${f.name}: unsupported format.`);
        return false;
      }
      if (f.size > MAX_IMAGE_BYTES) {
        toast.error(`${f.name}: exceeds 5 MB.`);
        return false;
      }
      return true;
    });
    const newImgs = valid.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    }));
    setImages((prev) => [...prev, ...newImgs]);
  }, []);

  function removeImage(id: string) {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
  }

  /* Drag & drop zone */
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  }

  /* Image reorder via drag */
  function onDragStartImg(idx: number) { setDragIdx(idx); }
  function onDragOverImg(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(dragIdx, 1);
      if (item) next.splice(idx, 0, item);
      return next;
    });
    setDragIdx(idx);
  }
  function onDragEndImg() { setDragIdx(null); }

  /* ── Rich text editor commands ───────────────────────────────────── */
  function execCmd(cmd: string, value?: string) {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  }
  function insertLink() {
    const url = prompt('Enter URL:');
    if (url) execCmd('createLink', url);
  }

  /* ── Toggle Size ─────────────────────────────────────────────────── */
  function toggleSize(size: string) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  }

  /* ── Submit ──────────────────────────────────────────────────────── */
  function submit(isDraft: boolean) {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);

    // Controlled fields
    fd.set('gender', selectedGender);
    fd.set('categoryId', selectedCategory);
    fd.set('subCategoryId', selectedSubCategory);
    fd.set('isActive', String(published));
    fd.set('isFeatured', String(featured));
    fd.set('isNewArrival', String(newArrival));
    fd.set('isBestSeller', String(bestSeller));
    fd.set('isOnSale', String(onSale));
    fd.set('isDraft', String(isDraft));
    fd.set('availableSizes', selectedSizes.join(','));

    // Rich text
    fd.set('fullDescription', editorRef.current?.innerHTML ?? '');

    // Images
    fd.delete('image');
    images.forEach(({ file }) => fd.append('image', file));

    // Variants (auto-generated from sizes + color)
    const color = fd.get('color') as string || 'Default';
    const stockQty = parseInt(fd.get('stockQuantity') as string) || 0;
    const variants = selectedSizes.length > 0
      ? selectedSizes.map((size) => ({ size, color, stock: Math.floor(stockQty / selectedSizes.length), sku: '' }))
      : [{ size: 'One Size', color, stock: stockQty, sku: '' }];
    fd.set('variants', JSON.stringify(variants));

    if (!String(fd.get('name') ?? '').trim()) {
      toast.error('Product name is required.');
      return;
    }

    startTransition(async () => {
      const res = await createProduct(fd);
      if (res.ok) {
        toast.success(isDraft ? 'Draft saved.' : 'Product published.');
        router.push('/admin/products');
      } else {
        toast.error(res.error ?? 'Could not save.');
      }
    });
  }

  /* ── Filter categories by gender ─────────────────────────────────── */
  const filteredCategories = categories.filter((c) => c.gender === selectedGender);
  const activeCategory = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="mx-auto max-w-[960px] pb-12">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="flex size-[40px] items-center justify-center rounded-[10px] border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="size-[18px]" />
          </button>
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Add New Product</h1>
            <p className="text-[13px] text-slate-400">Fill in the details to create a new product</p>
          </div>
        </div>
      </div>

      <form ref={formRef} className="space-y-6">
        {/* ═══════════ 1. BASIC INFORMATION ═══════════ */}
        <Card className="p-6">
          <div className={sectionTitleCls}>
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Package className="size-4" />
            </div>
            Basic Information
          </div>
          <p className={sectionSubCls}>General information about the product</p>

          <div className="mt-6 space-y-4">
            {/* Row 1: Name + SKU */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input name="name" className={inputCls} placeholder="e.g. Premium Cotton T-Shirt" />
              </div>
              <div>
                <label className={labelCls}>
                  SKU <span className="text-red-500">*</span>
                </label>
                <input name="sku" className={inputCls} placeholder="e.g. MTK-TS-001" />
              </div>
            </div>

            {/* Row 2: Slug */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Slug</label>
                <input name="slug" className={inputCls} placeholder="auto-generated-if-empty" />
              </div>
            </div>
          </div>
        </Card>

        {/* ═══════════ 2. PRICING & INVENTORY ═══════════ */}
        <Card className="p-6">
          <div className={sectionTitleCls}>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="size-4" />
            </div>
            Pricing &amp; Inventory
          </div>
          <p className={sectionSubCls}>Set your product pricing and stock levels</p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Price (PKR) <span className="text-red-500">*</span></label>
              <input type="number" name="price" min={0} className={inputCls} placeholder="e.g. 2500" />
            </div>
            <div>
              <label className={labelCls}>Sale Price (PKR)</label>
              <input type="number" name="salePrice" min={0} className={inputCls} placeholder="Leave empty if no sale" />
            </div>
            <div>
              <label className={labelCls}>Cost Price (PKR)</label>
              <input type="number" name="costPrice" min={0} className={inputCls} placeholder="For profit tracking" />
            </div>
            <div>
              <label className={labelCls}>Stock Quantity</label>
              <input type="number" name="stockQuantity" min={0} defaultValue={0} className={inputCls} placeholder="0" />
            </div>
            <div>
              <label className={labelCls}>Minimum Stock Alert</label>
              <input type="number" name="minStockAlert" min={0} defaultValue={0} className={inputCls} placeholder="Alert when stock falls below" />
            </div>
          </div>
        </Card>

        {/* ═══════════ 3. PRODUCT DETAILS ═══════════ */}
        <Card className="p-6">
          <div className={sectionTitleCls}>
            <div className="flex size-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <Info className="size-4" />
            </div>
            Product Details
          </div>
          <p className={sectionSubCls}>Detailed attributes for this product</p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Department */}
            <div>
              <label className={labelCls}>Department <span className="text-red-500">*</span></label>
              <select
                className={inputCls}
                value={selectedGender}
                onChange={(e) => {
                  const g = e.target.value;
                  setSelectedGender(g);
                  const cats = categories.filter((c) => c.gender === g);
                  setSelectedCategory(cats[0]?.id ?? '');
                  setSelectedSubCategory('');
                }}
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g.charAt(0) + g.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className={labelCls}>Category <span className="text-red-500">*</span></label>
              <select
                className={inputCls}
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubCategory('');
                }}
              >
                {filteredCategories.length === 0 && <option value="">No categories for this department</option>}
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Sub-category */}
            <div>
              <label className={labelCls}>Sub-category</label>
              <select
                className={inputCls}
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
              >
                <option value="">None</option>
                {activeCategory && activeCategory.subCategories.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Season */}
            <div>
              <label className={labelCls}>Season</label>
              <select name="season" className={inputCls}>
                <option value="">Select season</option>
                {SEASONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Material */}
            <div>
              <label className={labelCls}>Material</label>
              <input name="material" className={inputCls} placeholder="e.g. 100% Cotton" />
            </div>

            {/* Fabric */}
            <div>
              <label className={labelCls}>Fabric</label>
              <input name="fabric" className={inputCls} placeholder="e.g. Lawn, Cotton Silk, Velvet" />
            </div>

            {/* Color */}
            <div>
              <label className={labelCls}>Color</label>
              <input name="color" className={inputCls} placeholder="e.g. Navy Blue" />
            </div>

            {/* Secondary Color */}
            <div>
              <label className={labelCls}>Secondary Color</label>
              <input name="secondaryColor" className={inputCls} placeholder="e.g. White" />
            </div>

            {/* Size Type */}
            <div>
              <label className={labelCls}>Size Type</label>
              <select name="sizeType" className={inputCls}>
                <option value="">Select</option>
                <option value="Clothing">Clothing (S, M, L…)</option>
                <option value="Numeric">Numeric (28, 30, 32…)</option>
                <option value="Free">Free Size</option>
              </select>
            </div>

            {/* Available Sizes */}
            <div className="sm:col-span-2">
              <label className={labelCls}>Available Sizes</label>
              <div className="flex flex-wrap gap-2">
                {ALL_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`h-[34px] rounded-[8px] border px-3 text-[13px] font-medium transition-all ${
                      selectedSizes.includes(size)
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <input type="hidden" name="availableSizes" value={selectedSizes.join(',')} />
            </div>

            {/* Fit */}
            <div>
              <label className={labelCls}>Fit</label>
              <select name="fit" className={inputCls}>
                <option value="">Select fit</option>
                {FITS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Pattern */}
            <div>
              <label className={labelCls}>Pattern</label>
              <input name="pattern" className={inputCls} placeholder="e.g. Striped, Solid, Printed" />
            </div>

            {/* Sleeve Type */}
            <div>
              <label className={labelCls}>Sleeve Type</label>
              <select name="sleeveType" className={inputCls}>
                <option value="">Select</option>
                <option value="Full Sleeve">Full Sleeve</option>
                <option value="Half Sleeve">Half Sleeve</option>
                <option value="Short Sleeve">Short Sleeve</option>
                <option value="Sleeveless">Sleeveless</option>
                <option value="3/4 Sleeve">3/4 Sleeve</option>
              </select>
            </div>

            {/* Neck Type */}
            <div>
              <label className={labelCls}>Neck Type</label>
              <select name="neckType" className={inputCls}>
                <option value="">Select</option>
                <option value="Round Neck">Round Neck</option>
                <option value="V-Neck">V-Neck</option>
                <option value="Collar">Collar</option>
                <option value="Crew Neck">Crew Neck</option>
                <option value="Henley">Henley</option>
                <option value="Mandarin">Mandarin</option>
                <option value="Hooded">Hooded</option>
                <option value="Ban Collar">Ban Collar</option>
              </select>
            </div>

            {/* Occasion */}
            <div>
              <label className={labelCls}>Occasion</label>
              <input name="occasion" className={inputCls} placeholder="e.g. Casual, Formal, Party, Wedding" />
            </div>
          </div>
        </Card>

        {/* ═══════════ 4. MEDIA ═══════════ */}
        <Card className="p-6">
          <div className={sectionTitleCls}>
            <div className="flex size-8 items-center justify-center rounded-lg bg-pink-50 text-pink-600">
              <Camera className="size-4" />
            </div>
            Media
          </div>
          <p className={sectionSubCls}>Upload product images and video</p>

          {/* Drag & Drop Area */}
          <div
            className={`mt-6 rounded-[12px] border-2 border-dashed p-8 text-center transition-colors ${
              dragOver
                ? 'border-indigo-400 bg-indigo-50/50'
                : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-slate-100">
              <Upload className="size-6 text-slate-400" />
            </div>
            <p className="text-[14px] font-medium text-slate-700">
              Drag &amp; drop images here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="font-semibold text-indigo-600 hover:text-indigo-700 underline-offset-2 hover:underline"
              >
                browse
              </button>
            </p>
            <p className="mt-2 text-[12px] text-slate-400">
              Supports: JPG, PNG, WEBP · Max 5 MB per image
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
              className="hidden"
            />
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-[12px] font-medium text-slate-500">
                {images.length} image{images.length !== 1 ? 's' : ''} · Drag to reorder
              </p>
              <div className="flex flex-wrap gap-3">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => onDragStartImg(idx)}
                    onDragOver={(e) => onDragOverImg(e, idx)}
                    onDragEnd={onDragEndImg}
                    className={`group relative size-[100px] overflow-hidden rounded-[10px] border-2 bg-slate-50 transition-all cursor-grab active:cursor-grabbing ${
                      dragIdx === idx ? 'border-indigo-400 opacity-60 scale-95' : 'border-slate-200'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.preview} alt="preview" className="size-full object-cover" />
                    {/* Grip handle */}
                    <div className="absolute left-1 top-1 flex size-6 items-center justify-center rounded-md bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <GripVertical className="size-3.5" />
                    </div>
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-red-600 text-white opacity-0 transition-opacity hover:bg-red-700 group-hover:opacity-100"
                    >
                      <X className="size-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 rounded bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        Main
                      </span>
                    )}
                  </div>
                ))}

                {/* Add more button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex size-[100px] flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-slate-200 bg-white text-slate-400 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-500"
                >
                  <ImageIcon className="mb-1 size-5" />
                  <span className="text-[11px] font-medium">Add More</span>
                </button>
              </div>
            </div>
          )}

          {/* Video URL */}
          <div className="mt-6">
            <label className={labelCls}>
              <Video className="mb-0.5 mr-1.5 inline size-4 text-slate-400" />
              Product Video URL
              <span className="ml-2 text-[11px] font-normal text-slate-400">(Optional)</span>
            </label>
            <input name="videoUrl" className={inputCls} placeholder="https://youtube.com/watch?v=..." />
          </div>
        </Card>

        {/* ═══════════ 5. PRODUCT DESCRIPTION ═══════════ */}
        <Card className="p-6">
          <div className={sectionTitleCls}>
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <FileText className="size-4" />
            </div>
            Product Description
          </div>
          <p className={sectionSubCls}>Describe your product in detail</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className={labelCls}>Short Description</label>
              <textarea
                name="shortDescription"
                rows={2}
                className={`${inputCls} h-auto py-[10px]`}
                placeholder="Brief summary for product cards and search results…"
              />
            </div>

            <div>
              <label className={labelCls}>Full Description</label>
              {/* Rich Text Toolbar */}
              <div className="rounded-t-[10px] border border-b-0 border-slate-200 bg-slate-50 px-2 py-1.5 flex flex-wrap items-center gap-0.5">
                {[
                  { icon: Bold, cmd: 'bold', title: 'Bold' },
                  { icon: Italic, cmd: 'italic', title: 'Italic' },
                  { icon: Underline, cmd: 'underline', title: 'Underline' },
                ].map(({ icon: Icon, cmd, title }) => (
                  <button
                    key={cmd}
                    type="button"
                    onClick={() => execCmd(cmd)}
                    title={title}
                    className="flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-white hover:text-slate-800 transition-colors"
                  >
                    <Icon className="size-4" />
                  </button>
                ))}
                <div className="mx-1 h-5 w-px bg-slate-200" />
                <button type="button" onClick={() => execCmd('insertUnorderedList')} title="Bullet List"
                  className="flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-white hover:text-slate-800 transition-colors">
                  <List className="size-4" />
                </button>
                <button type="button" onClick={() => execCmd('insertOrderedList')} title="Numbered List"
                  className="flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-white hover:text-slate-800 transition-colors">
                  <ListOrdered className="size-4" />
                </button>
                <div className="mx-1 h-5 w-px bg-slate-200" />
                <button type="button" onClick={insertLink} title="Insert Link"
                  className="flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-white hover:text-slate-800 transition-colors">
                  <Link2 className="size-4" />
                </button>
                <button type="button" onClick={() => execCmd('formatBlock', 'H2')} title="Heading"
                  className="flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-white hover:text-slate-800 transition-colors">
                  <Heading2 className="size-4" />
                </button>
              </div>
              {/* Editable Area */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="min-h-[160px] rounded-b-[10px] border border-slate-200 bg-white px-[14px] py-[10px] text-[14px] text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 prose prose-sm max-w-none"
                style={{ wordBreak: 'break-word' }}
              />
            </div>

            {/* Plain description fallback for existing backend */}
            <div>
              <label className={labelCls}>Care Instructions</label>
              <textarea
                name="careInstructions"
                rows={2}
                className={`${inputCls} h-auto py-[10px]`}
                placeholder="e.g. Dry clean only. Wash separately in cold water."
              />
            </div>
          </div>
        </Card>

        {/* ═══════════ 6. SEO ═══════════ */}
        <Card className="p-6">
          <div className={sectionTitleCls}>
            <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
              <SearchIcon className="size-4" />
            </div>
            SEO
          </div>
          <p className={sectionSubCls}>Optimize for search engines</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className={labelCls}>SEO Title</label>
              <input name="seoTitle" className={inputCls} placeholder="Custom title for search results" />
            </div>
            <div>
              <label className={labelCls}>Meta Description</label>
              <textarea name="metaDescription" rows={2} className={`${inputCls} h-auto py-[10px]`} placeholder="Brief description for search engines (max 160 chars)" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Keywords</label>
                <input name="keywords" className={inputCls} placeholder="Comma-separated keywords" />
              </div>
              <div>
                <label className={labelCls}>Canonical URL</label>
                <input name="canonicalUrl" className={inputCls} placeholder="https://mtk.pk/product/..." />
              </div>
            </div>
            <div>
              <label className={labelCls}>Open Graph Image URL</label>
              <input name="ogImage" className={inputCls} placeholder="URL for social sharing thumbnail" />
            </div>
          </div>
        </Card>

        {/* ═══════════ 7. SHIPPING ═══════════ */}
        <Card className="p-6">
          <div className={sectionTitleCls}>
            <div className="flex size-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <Truck className="size-4" />
            </div>
            Shipping
          </div>
          <p className={sectionSubCls}>Product dimensions and shipping details</p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Weight (kg)</label>
              <input type="number" name="weight" min={0} step={0.01} className={inputCls} placeholder="0.00" />
            </div>
            <div>
              <label className={labelCls}>Length (cm)</label>
              <input type="number" name="shippingLength" min={0} step={0.1} className={inputCls} placeholder="0.0" />
            </div>
            <div>
              <label className={labelCls}>Width (cm)</label>
              <input type="number" name="shippingWidth" min={0} step={0.1} className={inputCls} placeholder="0.0" />
            </div>
            <div>
              <label className={labelCls}>Height (cm)</label>
              <input type="number" name="shippingHeight" min={0} step={0.1} className={inputCls} placeholder="0.0" />
            </div>
            <div>
              <label className={labelCls}>Shipping Class</label>
              <select name="shippingClass" className={inputCls}>
                <option value="">Select</option>
                <option value="Standard">Standard</option>
                <option value="Express">Express</option>
                <option value="Free Shipping">Free Shipping</option>
                <option value="Heavy">Heavy / Oversized</option>
              </select>
            </div>
          </div>
        </Card>

        {/* ═══════════ 8. PRODUCT STATUS ═══════════ */}
        <Card className="p-6">
          <div className={sectionTitleCls}>
            <div className="flex size-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <ToggleLeft className="size-4" />
            </div>
            Product Status
          </div>
          <p className={sectionSubCls}>Control visibility and badges</p>

          <div className="mt-6 space-y-4">
            {[
              { label: 'Published', desc: 'Product is visible on the store', value: published, set: setPublished },
              { label: 'Featured Product', desc: 'Show on homepage featured section', value: featured, set: setFeatured },
              { label: 'New Arrival', desc: 'Display "New" badge on product', value: newArrival, set: setNewArrival },
              { label: 'Best Seller', desc: 'Display "Best Seller" badge', value: bestSeller, set: setBestSeller },
              { label: 'On Sale', desc: 'Display "Sale" badge and sale price', value: onSale, set: setOnSale },
            ].map(({ label, desc, value, set }) => (
              <div key={label} className="flex items-center justify-between rounded-[10px] border border-slate-100 bg-slate-50/50 px-4 py-3">
                <div>
                  <p className="text-[14px] font-medium text-slate-800">{label}</p>
                  <p className="text-[12px] text-slate-400">{desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => set(!value)}
                  className={`relative inline-flex h-[26px] w-[48px] shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                    value ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block size-[22px] rounded-full bg-white shadow-sm transition-transform ${
                      value ? 'translate-x-[24px]' : 'translate-x-[2px]'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* ═══════════ 9. ACTION BUTTONS ═══════════ */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="h-[44px] rounded-[10px] border border-slate-200 bg-white px-6 text-[14px] font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => submit(true)}
            disabled={pending}
            className="h-[44px] rounded-[10px] border border-slate-200 bg-white px-6 text-[14px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="size-4" />
            {pending ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            type="button"
            onClick={() => submit(false)}
            disabled={pending}
            className="h-[44px] rounded-[10px] bg-indigo-600 px-6 text-[14px] font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="size-4" />
            {pending ? 'Publishing…' : 'Publish Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
