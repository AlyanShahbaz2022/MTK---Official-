import type { Metadata } from 'next';
import { requireUser } from '@/lib/session';
import { AccountNav } from '@/components/account/account-nav';

export const metadata: Metadata = { title: 'My Account' };

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense-in-depth: middleware guards this too.
  const user = await requireUser();

  return (
    <main className="mx-auto max-w-screen-2xl px-6 py-14 md:px-10 md:py-20">
      <div className="mb-10">
        <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent">
          My Account
        </span>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
          {user.name ?? 'Welcome'}
        </h1>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="lg:border-r lg:border-primary/10 lg:pr-4">
          <AccountNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
