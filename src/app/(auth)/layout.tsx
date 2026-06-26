import Image from 'next/image';
import Link from 'next/link';

/** Editorial split-screen auth shell — image panel + form panel. */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Image panel */}
      <div className="relative hidden lg:block">
        <Image
          src="/images/editorial.jpg"
          alt="MTK"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/30" />
        <div className="absolute bottom-0 left-0 p-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent">
            MTK Atelier
          </p>
          <p className="mt-4 max-w-sm font-display text-3xl font-medium leading-tight text-white">
            Timeless clothing, crafted to be kept.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 sm:py-16 md:px-10">
        <Link
          href="/"
          className="mb-10 font-display text-2xl font-semibold tracking-[0.2em] text-foreground xs:text-3xl xs:tracking-[0.3em] sm:mb-12"
        >
          MTK
        </Link>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
