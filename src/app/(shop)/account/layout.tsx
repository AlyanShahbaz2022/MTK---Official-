import type { Metadata } from 'next';
import { requireUser } from '@/lib/session';
import { AccountNav } from '@/components/account/account-nav';
import { Container } from '@/components/ui/container';

export const metadata: Metadata = { title: 'My Account' };

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense-in-depth: middleware guards this too.
  const user = await requireUser();

  return (
    <Container as="main" bleed className="max-w-screen-2xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
      <div className="mb-8 sm:mb-10">
        <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent">
          My Account
        </span>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl md:text-5xl">
          {user.name ?? 'Welcome'}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="lg:border-r lg:border-primary/10 lg:pr-4">
          <AccountNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
