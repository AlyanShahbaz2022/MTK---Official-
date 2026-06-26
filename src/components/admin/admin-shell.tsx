'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Wallet,
  Users,
  BarChart3,
  Settings,
  LayoutTemplate,
  Menu,
  Search,
  Maximize,
  Bell,
  ChevronDown,
  LogOut,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logoutAction } from '@/server/actions/auth';

const nav = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Homepage', href: '/admin/homepage', icon: LayoutTemplate },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: Tags },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Payments', href: '/admin/payments', icon: Wallet },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminShell({
  children,
  userName,
  userEmail,
}: {
  children: ReactNode;
  userName: string;
  userEmail: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  const SidebarLinks = (
    <nav className="flex flex-col gap-[4px] px-[12px]">
      {nav.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-[12px] rounded-[10px] px-[14px] py-[11px] text-[14px] font-medium transition-colors',
              active
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
              collapsed && 'lg:justify-center lg:px-0',
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="size-[20px] shrink-0" strokeWidth={1.8} />
            <span className={cn(collapsed && 'lg:hidden')}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const Brand = (
    <Link href="/admin" className="flex items-center gap-[10px]">
      <span className="flex size-[34px] items-center justify-center rounded-[9px] bg-indigo-600 text-[15px] font-bold text-white">
        M
      </span>
      <span className={cn('text-[18px] font-bold tracking-tight text-slate-900', collapsed && 'lg:hidden')}>
        MTK Admin
      </span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-slate-200 bg-white transition-all duration-300 lg:flex',
          collapsed ? 'w-[78px]' : 'w-[256px]',
        )}
      >
        <div className="flex h-[64px] items-center border-b border-slate-200 px-[20px]">{Brand}</div>
        <div className="flex-1 overflow-y-auto py-[16px]">{SidebarLinks}</div>
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-[256px] flex-col bg-white lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex h-[64px] items-center justify-between border-b border-slate-200 px-[20px]">
                {Brand}
                <button type="button" onClick={() => setMobileOpen(false)} className="text-slate-400">
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-[16px]">{SidebarLinks}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className={cn('transition-all duration-300', collapsed ? 'lg:pl-[78px]' : 'lg:pl-[256px]')}>
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-[64px] items-center gap-[16px] border-b border-slate-200 bg-white/90 px-[16px] backdrop-blur md:px-[24px]">
          <button
            type="button"
            aria-label="Toggle sidebar"
            onClick={() => {
              setCollapsed((c) => !c);
              setMobileOpen((o) => !o);
            }}
            className="flex size-[40px] items-center justify-center rounded-[10px] text-slate-500 hover:bg-slate-100"
          >
            <Menu className="size-[20px]" />
          </button>

          {/* Search */}
          <div className="relative hidden max-w-[420px] flex-1 sm:block">
            <Search className="pointer-events-none absolute left-[14px] top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search anything…"
              className="h-[42px] w-full rounded-[10px] border border-slate-200 bg-slate-50 pl-[42px] pr-[14px] text-[14px] text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="ml-auto flex items-center gap-[6px]">
            <button
              type="button"
              aria-label="Fullscreen"
              onClick={toggleFullscreen}
              className="hidden size-[40px] items-center justify-center rounded-[10px] text-slate-500 hover:bg-slate-100 sm:flex"
            >
              <Maximize className="size-[19px]" />
            </button>
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex size-[40px] items-center justify-center rounded-[10px] text-slate-500 hover:bg-slate-100"
            >
              <Bell className="size-[19px]" />
              <span className="absolute right-[8px] top-[8px] flex size-[16px] items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                3
              </span>
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-[8px] rounded-[10px] py-[6px] pl-[6px] pr-[10px] hover:bg-slate-100"
              >
                <span className="flex size-[34px] items-center justify-center rounded-full bg-indigo-600 text-[13px] font-semibold text-white">
                  {userName.charAt(0).toUpperCase()}
                </span>
                <span className="hidden text-left md:block">
                  <span className="block text-[13px] font-semibold leading-tight text-slate-900">
                    {userName}
                  </span>
                  <span className="block text-[11px] leading-tight text-slate-400">Admin</span>
                </span>
                <ChevronDown className="size-[16px] text-slate-400" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-[52px] w-[220px] rounded-[12px] border border-slate-200 bg-white p-[8px] shadow-lg"
                  >
                    <div className="border-b border-slate-100 px-[12px] py-[10px]">
                      <p className="text-[13px] font-semibold text-slate-900">{userName}</p>
                      <p className="truncate text-[12px] text-slate-400">{userEmail}</p>
                    </div>
                    <Link
                      href="/"
                      className="mt-[6px] block rounded-[8px] px-[12px] py-[9px] text-[13px] text-slate-600 hover:bg-slate-50"
                    >
                      View storefront
                    </Link>
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="flex w-full items-center gap-[8px] rounded-[8px] px-[12px] py-[9px] text-[13px] text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="size-[16px]" />
                        Sign out
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-[16px] md:p-[24px]">{children}</main>
      </div>
    </div>
  );
}
