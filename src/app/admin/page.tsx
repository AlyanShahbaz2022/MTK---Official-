import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/session';
import { LogoutButton } from '@/components/auth/logout-button';

export const metadata: Metadata = { title: 'Admin' };

export default async function AdminPage() {
  // RBAC: ADMIN only (middleware + server-side guard). Spec §6.5.
  const user = await requireAdmin();

  return (
    <main className="mx-auto max-w-4xl px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-semibold uppercase tracking-tight">
          Admin Dashboard
        </h1>
        <LogoutButton />
      </div>
      <p className="text-base text-muted-foreground">
        Welcome, {user.name ?? user.email}. Product, order, and user management
        arrive in Phase 7.
      </p>
    </main>
  );
}
