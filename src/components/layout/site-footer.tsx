import Link from 'next/link';

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
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Search', href: '/search' },
      { label: 'Cart', href: '/cart' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-text-primary/10 bg-surface-base text-text-tertiary">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-8 py-8 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <p className="text-[1.5rem] font-semibold uppercase tracking-tight">
            MTK
          </p>
          <p className="mt-5 text-lg text-text-tertiary/70">
            Modern clothing for Men, Women &amp; Kids.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-md uppercase tracking-widest text-text-tertiary/60">
              {col.title}
            </h4>
            <ul className="mt-5 space-y-3">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-lg text-text-tertiary/80 transition-colors duration-instant hover:text-text-tertiary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-text-tertiary/10 px-8 py-6 text-center text-md uppercase tracking-widest text-text-tertiary/50">
        MTK © {new Date().getFullYear()} — All rights reserved
      </div>
    </footer>
  );
}
