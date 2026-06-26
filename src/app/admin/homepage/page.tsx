'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Upload, ArrowUp, ArrowDown, Save } from 'lucide-react';
import { Card, PageHeader } from '@/components/admin/ui';
import { Modal } from '@/components/admin/modal';
import { toast } from '@/store/admin-toast';
import {
  heroBanners as bannerSeed,
  categoryTiles as catSeed,
  promoTiles as promoSeed,
  initialMarquee,
  type HeroBanner,
  type ContentTile,
} from '@/lib/admin/mock-data';

const inputCls =
  'h-[42px] w-full rounded-[10px] border border-slate-200 bg-white px-[14px] text-[14px] text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100';
const labelCls = 'mb-[6px] block text-[13px] font-medium text-slate-600';

const emptyBanner: Omit<HeroBanner, 'id'> = {
  image: '',
  eyebrow: '',
  title: '',
  subtitle: '',
  cta: 'Shop Now',
  href: '/shop',
};

export default function HomepageContentPage() {
  const [banners, setBanners] = useState<HeroBanner[]>(bannerSeed);
  const [marquee, setMarquee] = useState(initialMarquee);
  const [catTiles, setCatTiles] = useState<ContentTile[]>(catSeed);
  const [promoTiles, setPromoTiles] = useState<ContentTile[]>(promoSeed);

  // Banner modal state
  const [bannerOpen, setBannerOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [bannerDraft, setBannerDraft] = useState<Omit<HeroBanner, 'id'>>(emptyBanner);
  const [bannerToDelete, setBannerToDelete] = useState<HeroBanner | null>(null);

  // Tile modal state
  const [tileOpen, setTileOpen] = useState(false);
  const [tileCtx, setTileCtx] = useState<{ list: 'cat' | 'promo'; tile: ContentTile } | null>(null);
  const [tileDraft, setTileDraft] = useState<ContentTile | null>(null);

  // --- Banner handlers ---
  function addBanner() {
    setEditingBanner(null);
    setBannerDraft(emptyBanner);
    setBannerOpen(true);
  }
  function editBanner(b: HeroBanner) {
    setEditingBanner(b);
    const { id: _id, ...rest } = b;
    setBannerDraft(rest);
    setBannerOpen(true);
  }
  function saveBanner() {
    if (!bannerDraft.title.trim() || !bannerDraft.image) {
      toast.error('Banner needs at least an image and a title.');
      return;
    }
    if (editingBanner) {
      setBanners((l) => l.map((b) => (b.id === editingBanner.id ? { ...editingBanner, ...bannerDraft } : b)));
      toast.success('Banner updated.');
    } else {
      setBanners((l) => [...l, { id: `b${Date.now()}`, ...bannerDraft }]);
      toast.success('Banner added.');
    }
    setBannerOpen(false);
  }
  function deleteBanner() {
    if (!bannerToDelete) return;
    setBanners((l) => l.filter((b) => b.id !== bannerToDelete.id));
    toast.success('Banner deleted.');
    setBannerToDelete(null);
  }
  function moveBanner(i: number, dir: -1 | 1) {
    setBanners((l) => {
      const next = [...l];
      const j = i + dir;
      if (j < 0 || j >= next.length) return l;
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });
  }
  function onBannerImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setBannerDraft((d) => ({ ...d, image: URL.createObjectURL(f) }));
  }

  // --- Tile handlers ---
  function editTile(list: 'cat' | 'promo', tile: ContentTile) {
    setTileCtx({ list, tile });
    setTileDraft({ ...tile });
    setTileOpen(true);
  }
  function saveTile() {
    if (!tileDraft || !tileCtx) return;
    const setter = tileCtx.list === 'cat' ? setCatTiles : setPromoTiles;
    setter((l) => l.map((t) => (t.id === tileDraft.id ? tileDraft : t)));
    toast.success('Section updated.');
    setTileOpen(false);
  }
  function onTileImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f && tileDraft) setTileDraft({ ...tileDraft, image: URL.createObjectURL(f) });
  }

  return (
    <>
      <PageHeader
        title="Homepage"
        subtitle="Manage your landing page banners and content sections."
      />

      {/* Hero banners */}
      <Card className="mb-[24px] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-[20px] py-[16px]">
          <div>
            <h3 className="text-[15px] font-semibold text-slate-900">Hero Banners</h3>
            <p className="text-[12px] text-slate-400">{banners.length} slides · auto-rotates every 6s</p>
          </div>
          <button
            type="button"
            onClick={addBanner}
            className="inline-flex h-[40px] items-center gap-[8px] rounded-[10px] bg-indigo-600 px-[16px] text-[14px] font-semibold text-white hover:bg-indigo-700"
          >
            <Plus className="size-[18px]" /> Add Banner
          </button>
        </div>

        <ul className="divide-y divide-slate-100">
          {banners.map((b, i) => (
            <li key={b.id} className="flex items-center gap-[16px] px-[20px] py-[14px]">
              <span className="w-[20px] text-[13px] font-medium text-slate-400">{i + 1}</span>
              <div className="h-[56px] w-[84px] shrink-0 overflow-hidden rounded-[8px] bg-slate-100">
                {b.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.image} alt={b.title} className="size-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-slate-900">{b.title}</p>
                <p className="truncate text-[12px] text-slate-400">{b.eyebrow}</p>
              </div>
              <div className="flex items-center gap-[4px]">
                <button type="button" onClick={() => moveBanner(i, -1)} aria-label="Move up" disabled={i === 0} className="flex size-[32px] items-center justify-center rounded-[8px] text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30">
                  <ArrowUp className="size-[15px]" />
                </button>
                <button type="button" onClick={() => moveBanner(i, 1)} aria-label="Move down" disabled={i === banners.length - 1} className="flex size-[32px] items-center justify-center rounded-[8px] text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30">
                  <ArrowDown className="size-[15px]" />
                </button>
                <button type="button" onClick={() => editBanner(b)} aria-label="Edit" className="flex size-[32px] items-center justify-center rounded-[8px] text-slate-500 hover:bg-indigo-50 hover:text-indigo-600">
                  <Pencil className="size-[15px]" />
                </button>
                <button type="button" onClick={() => setBannerToDelete(b)} aria-label="Delete" className="flex size-[32px] items-center justify-center rounded-[8px] text-slate-500 hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="size-[15px]" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {/* Marquee */}
      <Card className="mb-[24px] p-[20px]">
        <h3 className="text-[15px] font-semibold text-slate-900">Marquee Text</h3>
        <p className="mb-[14px] text-[12px] text-slate-400">The scrolling text band below the banner.</p>
        <div className="flex flex-col gap-[12px] sm:flex-row">
          <input className={inputCls} value={marquee} onChange={(e) => setMarquee(e.target.value)} />
          <button
            type="button"
            onClick={() => toast.success('Marquee updated.')}
            className="inline-flex h-[42px] shrink-0 items-center gap-[8px] rounded-[10px] bg-indigo-600 px-[18px] text-[14px] font-semibold text-white hover:bg-indigo-700"
          >
            <Save className="size-[16px]" /> Save
          </button>
        </div>
      </Card>

      {/* Section tiles */}
      <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-2">
        <TileSection title="Category Grid" subtitle="Three Ways to Wear Elegance" tiles={catTiles} onEdit={(t) => editTile('cat', t)} />
        <TileSection title="Promo Duo" subtitle="Elegance Redefined for Him & Her" tiles={promoTiles} onEdit={(t) => editTile('promo', t)} />
      </div>

      {/* Banner add/edit modal */}
      <Modal open={bannerOpen} onClose={() => setBannerOpen(false)} title={editingBanner ? 'Edit Banner' : 'Add Banner'} size="lg">
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
          <div className="sm:col-span-2">
            <span className={labelCls}>Banner image</span>
            <div className="flex items-center gap-[16px]">
              <div className="h-[80px] w-[130px] shrink-0 overflow-hidden rounded-[10px] border border-dashed border-slate-300 bg-slate-50">
                {bannerDraft.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={bannerDraft.image} alt="preview" className="size-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-[11px] text-slate-400">No image</span>
                )}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-[8px] rounded-[10px] border border-slate-200 px-[14px] py-[10px] text-[13px] font-medium text-slate-600 hover:bg-slate-50">
                <Upload className="size-[16px]" /> Upload image
                <input type="file" accept="image/*" onChange={onBannerImage} className="hidden" />
              </label>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Eyebrow (small top text)</label>
            <input className={inputCls} value={bannerDraft.eyebrow} onChange={(e) => setBannerDraft({ ...bannerDraft, eyebrow: e.target.value })} placeholder="e.g. New Season — 2026" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Title</label>
            <input className={inputCls} value={bannerDraft.title} onChange={(e) => setBannerDraft({ ...bannerDraft, title: e.target.value })} placeholder="Festive Lawn 2026" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Subtitle</label>
            <input className={inputCls} value={bannerDraft.subtitle} onChange={(e) => setBannerDraft({ ...bannerDraft, subtitle: e.target.value })} placeholder="Short supporting line" />
          </div>
          <div>
            <label className={labelCls}>Button label</label>
            <input className={inputCls} value={bannerDraft.cta} onChange={(e) => setBannerDraft({ ...bannerDraft, cta: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Button link</label>
            <input className={inputCls} value={bannerDraft.href} onChange={(e) => setBannerDraft({ ...bannerDraft, href: e.target.value })} placeholder="/women" />
          </div>
        </div>
        <div className="mt-[24px] flex justify-end gap-[10px]">
          <button type="button" onClick={() => setBannerOpen(false)} className="h-[42px] rounded-[10px] border border-slate-200 px-[18px] text-[14px] font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="button" onClick={saveBanner} className="h-[42px] rounded-[10px] bg-indigo-600 px-[20px] text-[14px] font-semibold text-white hover:bg-indigo-700">{editingBanner ? 'Save changes' : 'Add banner'}</button>
        </div>
      </Modal>

      {/* Banner delete confirm */}
      <Modal open={!!bannerToDelete} onClose={() => setBannerToDelete(null)} title="Delete banner" size="sm">
        <p className="text-[14px] text-slate-600">Remove <span className="font-semibold text-slate-900">{bannerToDelete?.title}</span> from the homepage carousel?</p>
        <div className="mt-[24px] flex justify-end gap-[10px]">
          <button type="button" onClick={() => setBannerToDelete(null)} className="h-[42px] rounded-[10px] border border-slate-200 px-[18px] text-[14px] font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="button" onClick={deleteBanner} className="h-[42px] rounded-[10px] bg-red-600 px-[20px] text-[14px] font-semibold text-white hover:bg-red-700">Delete</button>
        </div>
      </Modal>

      {/* Tile edit modal */}
      <Modal open={tileOpen} onClose={() => setTileOpen(false)} title="Edit Section" size="md">
        {tileDraft && (
          <div className="space-y-[18px]">
            <div>
              <span className={labelCls}>Image</span>
              <div className="flex items-center gap-[16px]">
                <div className="h-[80px] w-[64px] shrink-0 overflow-hidden rounded-[10px] border border-dashed border-slate-300 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {tileDraft.image && <img src={tileDraft.image} alt="preview" className="size-full object-cover" />}
                </div>
                <label className="inline-flex cursor-pointer items-center gap-[8px] rounded-[10px] border border-slate-200 px-[14px] py-[10px] text-[13px] font-medium text-slate-600 hover:bg-slate-50">
                  <Upload className="size-[16px]" /> Upload
                  <input type="file" accept="image/*" onChange={onTileImage} className="hidden" />
                </label>
              </div>
            </div>
            <div>
              <label className={labelCls}>Label</label>
              <input className={inputCls} value={tileDraft.label} onChange={(e) => setTileDraft({ ...tileDraft, label: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Link</label>
              <input className={inputCls} value={tileDraft.href} onChange={(e) => setTileDraft({ ...tileDraft, href: e.target.value })} />
            </div>
            <div className="flex justify-end gap-[10px]">
              <button type="button" onClick={() => setTileOpen(false)} className="h-[42px] rounded-[10px] border border-slate-200 px-[18px] text-[14px] font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={saveTile} className="h-[42px] rounded-[10px] bg-indigo-600 px-[20px] text-[14px] font-semibold text-white hover:bg-indigo-700">Save</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function TileSection({
  title,
  subtitle,
  tiles,
  onEdit,
}: {
  title: string;
  subtitle: string;
  tiles: ContentTile[];
  onEdit: (t: ContentTile) => void;
}) {
  return (
    <Card className="p-[20px]">
      <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
      <p className="mb-[16px] text-[12px] text-slate-400">{subtitle}</p>
      <div className="space-y-[10px]">
        {tiles.map((t) => (
          <div key={t.id} className="flex items-center gap-[12px] rounded-[10px] border border-slate-100 p-[10px]">
            <div className="h-[48px] w-[40px] shrink-0 overflow-hidden rounded-[6px] bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {t.image && <img src={t.image} alt={t.label} className="size-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-slate-900">{t.label}</p>
              <p className="truncate text-[12px] text-slate-400">{t.href}</p>
            </div>
            <button type="button" onClick={() => onEdit(t)} aria-label="Edit" className="flex size-[32px] items-center justify-center rounded-[8px] text-slate-500 hover:bg-indigo-50 hover:text-indigo-600">
              <Pencil className="size-[15px]" />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
