import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/session';
import { AdminShell } from '@/components/admin/admin-shell';
import { Toaster } from '@/components/admin/toaster';

export const metadata: Metadata = { title: 'Admin' };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // RBAC: ADMIN only (middleware + server guard). Spec §6.5.
  const user = await requireAdmin();

  return (
    <AdminShell userName={user.name ?? 'Admin'} userEmail={user.email ?? ''}>
      {children}
      <Toaster />
    </AdminShell>
  );
}
