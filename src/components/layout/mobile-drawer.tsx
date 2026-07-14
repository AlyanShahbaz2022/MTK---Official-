'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import {
  X,
  ChevronRight,
  ChevronDown,
  Phone,
  MessageCircle,
  Instagram,
  Store,
  Truck,
  Briefcase,
  Shirt,
  Layers,
  Footprints,
  Watch,
  Scissors,
  Sparkles,
  Wind,
  Home as HomeIcon,
  ShoppingBag,
  Tag,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavLink } from '@/components/layout/header-shell';

interface Props {
  open: boolean;
  onClose: () => void;
  departments: NavLink[];
  isAuthenticated: boolean;
}

/** Icon resolver by keyword. */
function iconFor(label: string): LucideIcon {
  const l = label.toLowerCase();
  if (/(eastern|kurta|suit|ethnic|shalwar|waist)/.test(l)) return Shirt;
  if (/t-?shirt|tee|oversized/.test(l)) return Shirt;
  if (/polo/.test(l)) return Shirt;
  if (/shirt/.test(l)) return Shirt;
  if (/bottom|trouser|pant|jean|short/.test(l)) return Footprints;
  if (/access|watch|belt/.test(l)) return Watch;
  if (/bag/.test(l)) return ShoppingBag;
  if (/unstitch|fabric/.test(l)) return Scissors;
  if (/fragrance|perfume|scent/.test(l)) return Sparkles;
  if (/outer|jacket|coat|hood/.test(l)) return Wind;
  if (/home|living/.test(l)) return HomeIcon;
  if (/layer|set|combo/.test(l)) return Layers;
  if (/boy|girl|kid/.test(l)) return Tag;
  if (/modest|west|ready/.test(l)) return Shirt;
  return Tag;
}

const listContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.08 } },
};
const listItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
};

export function MobileDrawer({ open, onClose, departments, isAuthenticated }: Props) {
  // Portal guard — createPortal needs document (client-only).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  /**
   * WHY PORTAL?
   * On non-home pages the <header> has `backdrop-blur-md` which creates a new
   * CSS containing block. Any `position:fixed` child is then positioned relative
   * to the header, not the viewport, so the drawer gets clipped / invisible.
   * Rendering into document.body escapes that stacking context entirely.
   */
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay — blocks touchmove so finger-scroll inside drawer never hits onClose */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            onTouchMove={(e) => e.preventDefault()}
          />

          {/* Glass panel — stops ALL touch propagation so nothing leaks to the page */}
          <motion.aside
            className="fixed inset-y-0 left-0 z-[61] flex w-[320px] max-w-[88%] flex-col overflow-hidden border-r border-white/10 text-white shadow-2xl backdrop-blur-2xl backdrop-saturate-150 md:hidden"
            style={{ backgroundColor: 'rgba(30,28,26,0.88)' }}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Menu"
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <DrawerContent
              onClose={onClose}
              departments={departments}
              isAuthenticated={isAuthenticated}
            />
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function DrawerContent({ onClose, departments, isAuthenticated }: Omit<Props, 'open'>) {
  const [active, setActive] = useState(0);
  const current = departments[active] ?? departments[0];

  return (
    <>
      {/* Header bar */}
      <div className="relative h-[68px] shrink-0 border-b border-white/10 bg-gradient-to-r from-[#1e1c1a] to-[#2c2a26]">
        <div className="flex h-full items-center px-5">
          <span className="font-display text-3xl font-semibold tracking-[0.3em] text-white">
            MTK
          </span>
        </div>
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60 active:scale-90"
        >
          <X className="size-8" strokeWidth={2.5} />
        </button>
      </div>

      {/* Department tabs */}
      <div className="flex shrink-0 border-b border-white/10">
        {departments.map((d, i) => (
          <button
            key={d.label}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              'relative flex-1 py-3.5 text-[13px] font-semibold uppercase tracking-wide transition-colors',
              i === active ? 'text-white' : 'text-white/40 hover:text-white/65',
            )}
          >
            {d.label}
            {i === active && (
              <motion.span
                layoutId="tab-underline"
                className="absolute inset-x-4 bottom-0 h-[2px] rounded-full bg-accent"
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Scrollable body */}
      {/* overscroll-y-contain stops rubber-band / scroll-chaining from bleeding to the page */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current?.label}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Shop All link */}
            <Link
              href={current?.href ?? '/shop'}
              onClick={onClose}
              className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.03] px-5 py-3.5"
            >
              <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-accent">
                Shop All {current?.label}
              </span>
              <ChevronRight className="size-6 text-accent/70" strokeWidth={2.5} />
            </Link>

            {/* Groups */}
            {current?.groups?.length ? (
              <GroupedList groups={current.groups} onClose={onClose} />
            ) : (
              <FlatList items={current?.children ?? []} onClose={onClose} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Customer care */}
        <div className="px-5 pb-3 pt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
            Customer Care
          </p>
          <div className="mt-3 flex gap-3">
            <ContactButton href="tel:+923000000000" label="Call" Icon={Phone} />
            <ContactButton href="https://wa.me/923000000000" label="WhatsApp" Icon={MessageCircle} />
            <ContactButton href="https://instagram.com" label="Instagram" Icon={Instagram} />
            <Link
              href={isAuthenticated ? '/account' : '/login'}
              onClick={onClose}
              className="ml-auto self-center text-[12px] uppercase tracking-[0.15em] text-white/55 transition-colors hover:text-white"
            >
              {isAuthenticated ? 'Account' : 'Sign in'}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="shrink-0 p-3">
        <div className="flex items-stretch gap-2 rounded-2xl border border-white/10 bg-white/[0.05] p-2">
          <BottomItem href="/shop" label="Stores" Icon={Store} onClose={onClose} />
          <BottomItem href="/account/orders" label="Tracking" Icon={Truck} onClose={onClose} />
          <BottomItem href="/shop" label="Careers" Icon={Briefcase} onClose={onClose} />
        </div>
      </div>
    </>
  );
}

/* ── Grouped list (when groups[] exists) ── */
function GroupedList({
  groups,
  onClose,
}: {
  groups: NonNullable<NavLink['groups']>;
  onClose: () => void;
}) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  return (
    <motion.ul
      className="flex flex-col"
      initial="hidden"
      animate="visible"
      variants={listContainer}
    >
      {groups.map((group) => {
        const isOpen = openGroup === group.heading;
        return (
          <motion.li key={group.heading} variants={listItem}>
            {/* Group heading — toggles sub-items */}
            <button
              type="button"
              onClick={() => setOpenGroup(isOpen ? null : group.heading)}
              className="flex w-full items-center gap-3.5 border-b border-white/[0.06] px-5 py-3.5 transition-colors hover:bg-white/[0.05]"
            >
              <span className="flex-1 text-left text-[13px] font-semibold uppercase tracking-[0.12em] text-white">
                {group.heading}
              </span>
              <ChevronDown
                strokeWidth={2.5}
                className={cn(
                  'size-8 text-white/50 transition-transform duration-200',
                  isOpen && 'rotate-180',
                )}
              />
            </button>

            {/* Sub-items */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden bg-white/[0.03]"
                >
                  {group.items.map((item) => {
                    const Icon = iconFor(item.label);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className="flex items-center gap-3.5 border-b border-white/[0.05] py-3 pl-10 pr-5 text-[13px] text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white"
                        >
                          <Icon className="size-[15px] shrink-0 text-accent/70" strokeWidth={1.75} />
                          <span className="flex-1">{item.label}</span>
                          <ChevronRight className="size-5 text-white/30" strokeWidth={2.5} />
                        </Link>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}

/* ── Flat list (legacy children[]) ── */
function FlatList({
  items,
  onClose,
}: {
  items: { label: string; href: string }[];
  onClose: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <motion.ul
      className="flex flex-col"
      initial="hidden"
      animate="visible"
      variants={listContainer}
    >
      {items.map((c) => {
        const Icon = iconFor(c.label);
        return (
          <motion.li key={c.href} variants={listItem} whileHover={{ scale: 1.012 }} whileTap={{ scale: 0.98 }}>
            <Link
              href={c.href}
              onClick={onClose}
              className="flex items-center gap-3.5 border-b border-white/[0.06] px-5 py-3.5 text-[14px] text-white transition-colors hover:bg-white/[0.06]"
            >
              <Icon className="size-[18px] shrink-0 text-white/75" strokeWidth={1.75} />
              <span className="flex-1">{c.label}</span>
              <ChevronRight className="size-6 text-white/35" strokeWidth={2.5} />
            </Link>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}

function ContactButton({ href, label, Icon }: { href: string; label: string; Icon: LucideIcon }) {
  return (
    <motion.a
      href={href}
      aria-label={label}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.07] text-white transition-colors hover:bg-white/[0.16]"
    >
      <Icon className="size-[18px]" strokeWidth={1.75} />
    </motion.a>
  );
}

function BottomItem({
  href,
  label,
  Icon,
  onClose,
}: {
  href: string;
  label: string;
  Icon: LucideIcon;
  onClose: () => void;
}) {
  return (
    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="flex-1">
      <Link
        href={href}
        onClick={onClose}
        className="flex flex-col items-center gap-1.5 rounded-xl py-2.5 text-white transition-colors hover:bg-white/[0.08]"
      >
        <Icon className="size-[19px]" strokeWidth={1.75} />
        <span className="text-[11px] font-medium tracking-wide">{label}</span>
      </Link>
    </motion.div>
  );
}
