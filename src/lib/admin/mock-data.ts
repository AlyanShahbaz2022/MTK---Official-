/**
 * Mock data for the admin dashboard (frontend-only).
 * Replace these with real DB/API calls when wiring the backend (Phase 7).
 */

export interface AdminProduct {
  id: string;
  name: string;
  sku: string;
  image: string;
  category: string;
  stock: number;
  price: number; // PKR
  status: 'Published' | 'Draft';
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  products: number;
}

export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Canceled';

export interface AdminOrder {
  id: string;
  customer: string;
  email: string;
  date: string;
  items: number;
  total: number;
  status: OrderStatus;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
  joined: string;
}

export const stats = [
  { label: 'Total Sales', value: 'Rs 4.82M', delta: '+12.4%', up: true, spark: [12, 18, 14, 22, 19, 26, 24, 31, 28, 35] },
  { label: 'Total Orders', value: '1,284', delta: '+8.1%', up: true, spark: [20, 24, 22, 28, 26, 30, 29, 34, 33, 38] },
  { label: 'Active Users', value: '6,540', delta: '+4.7%', up: true, spark: [30, 28, 33, 31, 36, 34, 39, 37, 42, 44] },
  { label: 'Total Products', value: '342', delta: '-1.2%', up: false, spark: [40, 39, 41, 38, 37, 39, 36, 35, 36, 34] },
];

export const monthlySales = [
  { label: 'Jan', value: 320 },
  { label: 'Feb', value: 410 },
  { label: 'Mar', value: 380 },
  { label: 'Apr', value: 520 },
  { label: 'May', value: 610 },
  { label: 'Jun', value: 700 },
  { label: 'Jul', value: 660 },
  { label: 'Aug', value: 740 },
  { label: 'Sep', value: 690 },
  { label: 'Oct', value: 810 },
  { label: 'Nov', value: 880 },
  { label: 'Dec', value: 960 },
];

export const traffic = [
  120, 132, 128, 145, 150, 168, 160, 182, 175, 196, 205, 220, 210, 238, 250,
  242, 268, 280, 275, 300,
];

export const salesByCategory = [
  { label: 'Unstitched', value: 42, color: '#4f46e5' },
  { label: 'Ready to Wear', value: 28, color: '#0ea5e9' },
  { label: 'Luxury Pret', value: 18, color: '#f59e0b' },
  { label: 'Men', value: 12, color: '#10b981' },
];

export const products: AdminProduct[] = [
  { id: 'p1', name: 'Embroidered Lawn Suit', sku: 'EMBLAWN-001', image: '/images/cat-women.jpg', category: 'Unstitched', stock: 48, price: 5500, status: 'Published' },
  { id: 'p2', name: 'Classic Cotton Shirt', sku: 'CLCOTTON-002', image: '/images/cat-men.jpg', category: 'Men', stock: 120, price: 3200, status: 'Published' },
  { id: 'p3', name: 'Festive Three-Piece', sku: 'FEST3PC-003', image: '/images/editorial.jpg', category: 'Luxury Pret', stock: 12, price: 12800, status: 'Published' },
  { id: 'p4', name: 'Kids Printed Kurta', sku: 'KIDKURTA-004', image: '/images/cat-kids.jpg', category: 'Ready to Wear', stock: 0, price: 2100, status: 'Draft' },
  { id: 'p5', name: 'Embroidered Khaddar', sku: 'KHADDAR-005', image: '/images/hero.jpg', category: 'Unstitched', stock: 64, price: 4800, status: 'Published' },
  { id: 'p6', name: 'Luxury Festive Gown', sku: 'LUXGOWN-006', image: '/images/cat-women.jpg', category: 'Luxury Pret', stock: 7, price: 18500, status: 'Draft' },
];

export const categories: AdminCategory[] = [
  { id: 'c1', name: 'Unstitched', slug: 'unstitched', products: 86 },
  { id: 'c2', name: 'Ready to Wear', slug: 'ready-to-wear', products: 64 },
  { id: 'c3', name: 'Luxury Pret', slug: 'luxury-pret', products: 39 },
  { id: 'c4', name: 'Men', slug: 'men', products: 52 },
  { id: 'c5', name: 'Accessories', slug: 'accessories', products: 28 },
];

export const orders: AdminOrder[] = [
  { id: '#MTK-1043', customer: 'Ayesha Khan', email: 'ayesha@example.com', date: '2026-06-20', items: 3, total: 14800, status: 'Pending' },
  { id: '#MTK-1042', customer: 'Bilal Ahmed', email: 'bilal@example.com', date: '2026-06-20', items: 1, total: 3200, status: 'Shipped' },
  { id: '#MTK-1041', customer: 'Sana Malik', email: 'sana@example.com', date: '2026-06-19', items: 2, total: 9600, status: 'Delivered' },
  { id: '#MTK-1040', customer: 'Hamza Ali', email: 'hamza@example.com', date: '2026-06-19', items: 5, total: 26500, status: 'Pending' },
  { id: '#MTK-1039', customer: 'Maryam Tariq', email: 'maryam@example.com', date: '2026-06-18', items: 1, total: 5500, status: 'Canceled' },
  { id: '#MTK-1038', customer: 'Usman Sheikh', email: 'usman@example.com', date: '2026-06-18', items: 4, total: 18200, status: 'Delivered' },
];

export const customers: AdminCustomer[] = [
  { id: 'u1', name: 'Ayesha Khan', email: 'ayesha@example.com', orders: 12, spent: 142000, joined: '2025-11-02' },
  { id: 'u2', name: 'Bilal Ahmed', email: 'bilal@example.com', orders: 4, spent: 38400, joined: '2026-01-15' },
  { id: 'u3', name: 'Sana Malik', email: 'sana@example.com', orders: 8, spent: 96500, joined: '2025-09-21' },
  { id: 'u4', name: 'Hamza Ali', email: 'hamza@example.com', orders: 2, spent: 31200, joined: '2026-03-08' },
  { id: 'u5', name: 'Maryam Tariq', email: 'maryam@example.com', orders: 6, spent: 71800, joined: '2025-12-11' },
];

// --- Homepage / landing content (frontend-managed) ---

export interface HeroBanner {
  id: string;
  image: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
}

export const heroBanners: HeroBanner[] = [
  { id: 'b1', image: '/images/hero banner.webp', eyebrow: 'Save up to 40% — Eid Edit', title: 'Festive Lawn 2026', subtitle: 'Three-piece unstitched suits — a limited seasonal release.', cta: 'Shop the Edit', href: '/women' },
  { id: 'b2', image: '/images/hero banner 2.webp', eyebrow: 'New Arrivals', title: 'Luxury Festive', subtitle: 'Hand-embroidered formals, crafted for the season.', cta: 'Discover', href: '/shop' },
  { id: 'b3', image: '/images/hero banner 3.webp', eyebrow: 'Winter Collection', title: 'Embroidered Khaddar', subtitle: 'Warm, refined, everyday elegance.', cta: 'Explore', href: '/women' },
  { id: 'b4', image: '/images/herror banner 4.webp', eyebrow: 'Signature Edit', title: 'Timeless Classics', subtitle: 'Elevated essentials for every occasion.', cta: 'Shop Now', href: '/shop' },
  { id: 'b5', image: '/images/herro banner 5.webp', eyebrow: 'Limited Release', title: 'The Festive Edit', subtitle: 'Statement pieces, made to be remembered.', cta: 'Discover', href: '/women' },
];

export interface ContentTile {
  id: string;
  label: string;
  image: string;
  href: string;
}

export const categoryTiles: ContentTile[] = [
  { id: 't1', label: 'Unstitched', image: '/images/cat-women.jpg', href: '/women' },
  { id: 't2', label: 'Ready to Wear', image: '/images/editorial.jpg', href: '/shop' },
  { id: 't3', label: 'Freedom to Buy', image: '/images/herror banner 4.webp', href: '/men' },
];

export const promoTiles: ContentTile[] = [
  { id: 'pr1', label: 'Luxury', image: '/images/women 1.webp', href: '/women' },
  { id: 'pr2', label: 'Men', image: '/images/Men 1.webp', href: '/men' },
];

export const initialMarquee = 'OF PAKISTAN · MTK · THE FABRIC OF ELEGANCE · TIMELESS · ';

export function formatPKR(n: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(n);
}
