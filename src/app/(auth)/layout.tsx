import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-8 py-8">
      <Link
        href="/"
        className="mb-8 text-[2rem] font-semibold uppercase tracking-tight text-text-primary"
      >
        MTK
      </Link>
      <div className="w-full max-w-sm rounded-md border border-text-primary/10 bg-background p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
