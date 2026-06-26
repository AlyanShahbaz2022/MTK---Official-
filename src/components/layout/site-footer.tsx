import Link from 'next/link';
import { NewsletterForm } from '@/components/layout/newsletter-form';

const columns = [
  {
    title: 'Shop',
    links: [
      { label: 'Men', href: '/men' },
      { label: 'Women', href: '/women' },
      { label: 'Kids', href: '/kids' },
      { label: 'Shop All', href: '/shop' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign in', href: '/login' },
      { label: 'Create account', href: '/register' },
      { label: 'My account', href: '/account' },
      { label: 'Wishlist', href: '/wishlist' },
    ],
  },
  {
    title: 'Client Care',
    links: [
      { label: 'Search', href: '/search' },
      { label: 'Cart', href: '/cart' },
      { label: 'Shipping & Returns', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
];

/** Luxury footer — always dark, newsletter band + link columns. */
export function SiteFooter() {
  return (
    <footer className="bg-dark-gray text-light-gray">
      {/* Newsletter band */}
      <div className="border-b border-light-gray/10">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-center px-4 py-12 text-center sm:px-6 sm:py-16 md:px-10">
          <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent">
            The MTK World
          </span>
          <h2 className="mt-5 max-w-xl font-display text-3xl font-medium tracking-wide text-light-gray md:text-4xl">
            Receive our latest collections &amp; private invitations
          </h2>
          <div className="mt-8 flex w-full justify-center">
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Link columns */}
      <div className="mx-auto grid max-w-screen-2xl grid-cols-2 gap-8 px-4 py-12 sm:gap-10 sm:px-6 sm:py-16 md:grid-cols-4 md:px-10">
        <div className="col-span-2 md:col-span-1">
          <p className="font-display text-2xl font-semibold tracking-[0.3em]">
            MTK
          </p>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-light-gray/60">
            Timeless, considered clothing for Men, Women &amp; Kids — crafted to
            last beyond the season.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-[11px] font-medium uppercase tracking-[0.25em] text-light-gray/50">
              {col.title}
            </h3>
            <ul className="mt-6 space-y-4">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-light-gray/80 transition-colors duration-fast ease-luxe hover:text-accent"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-light-gray/10">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-3 px-4 py-7 text-center text-[11px] uppercase tracking-[0.2em] text-light-gray/40 sm:px-6 md:flex-row md:px-10">
          <span>MTK © {new Date().getFullYear()} — All rights reserved</span>
          <span className="flex gap-6">
            <Link href="#" className="hover:text-accent">
              Privacy
            </Link>
            <Link href="#" className="hover:text-accent">
              Terms
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
