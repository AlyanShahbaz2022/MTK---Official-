import type { Metadata } from 'next';
import { requireUser } from '@/lib/session';
import { LogoutButton } from '@/components/auth/logout-button';

export const metadata: Metadata = { title: 'My Account' };

export default async function AccountPage() {
  // Defense-in-depth: middleware guards this too, but we re-check on the server.
  const user = await requireUser();

  return (
    <main className="mx-auto max-w-2xl px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-semibold uppercase tracking-tight">
          My Account
        </h1>
        <LogoutButton />
      </div>

      <dl className="space-y-6 rounded-md border border-text-primary/10 p-8">
        <div>
          <dt className="text-md uppercase tracking-widest text-muted-foreground">
            Name
          </dt>
          <dd className="text-base">{user.name ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-md uppercase tracking-widest text-muted-foreground">
            Email
          </dt>
          <dd className="text-base">{user.email}</dd>
        </div>
        <div>
          <dt className="text-md uppercase tracking-widest text-muted-foreground">
            Role
          </dt>
          <dd className="text-base">{user.role}</dd>
        </div>
      </dl>
    </main>
  );
}
