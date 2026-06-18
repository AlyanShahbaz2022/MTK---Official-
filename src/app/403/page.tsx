import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-7 px-8 text-center">
      <p className="text-4xl font-semibold uppercase tracking-widest text-muted-foreground">
        403
      </p>
      <h1 className="text-4xl font-semibold uppercase tracking-tight">
        Access denied
      </h1>
      <p className="max-w-sm text-base text-muted-foreground">
        You don&apos;t have permission to view this page.
      </p>
      <Link href="/" className={buttonVariants({ variant: 'outline' })}>
        Back to home
      </Link>
    </main>
  );
}
