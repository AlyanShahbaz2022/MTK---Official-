# MTK Frontend Redesign — Luxury Edition (Roadmap)

> A complete **presentation-layer** redesign to a premium, timeless luxury aesthetic
> (think Apple interactions × Zara/COS minimalism × Uniqlo product clarity).
> **Backend, data layer, server actions, auth, and security logic are NOT touched** —
> only components, styling, layout, and animation.

---

## Design System (the new source of truth)

| Token | Value | Use |
|-------|-------|-----|
| `--color-primary` | `#111111` | Text, buttons, dark surfaces |
| `--color-background` | `#FAF8F5` | Page canvas (warm ivory) |
| `--color-accent` | `#C8A97E` | Gold — links, focus, fine detail (used sparingly) |
| `--color-dark-gray` | `#2B2B2B` | Footer, dark sections |
| `--color-light-gray` | `#E5E5E5` | Borders, dividers, muted fills |

**Typography:** Playfair Display (headings, serif elegance) · Inter (body/UI).
**Dark mode:** ivory ↔ near-black inversion via `class` strategy + toggle.
**Motion (restrained, luxury):** fade-in, scroll-reveal, parallax hero, image hover-zoom,
fly-to-cart, sticky/shrinking navbar, smooth page transitions.
**Banned:** bright/neon colors, heavy gradients, bounce, rotation, flashing.

---

## How this maps onto the existing app
The backend already serves: products, variants, cart (DB + guest), wishlist, auth, RBAC.
The redesign **re-skins the components that consume them** — no query, action, or schema changes.

---

## Phases (built one module at a time, each verified + committed)

### FE-0 — Design Foundations
Tailwind theme + tokens (colors, Playfair/Inter via `next/font`), dark-mode plumbing,
global styles, motion primitives (reveal/fade wrappers), and base UI atoms
(Button, Input, Badge) restyled. No page looks final yet, but the system is in place.

### FE-1 — Navigation & Shell
Luxury sticky navbar (shrinks on scroll, transparent-over-hero → solid), mega/slide nav,
search trigger, account/cart/wishlist icons, dark-mode toggle, refined mega footer,
mobile drawer. Page-transition wrapper.

### FE-2 — Homepage
Parallax hero, editorial brand story sections (scroll-reveal), category showcase,
featured/new-arrivals carousels, newsletter band. This becomes the showcase page.

### FE-3 — Product Listing (Shop / Men / Women / Kids)
Editorial grid, refined filter/sort drawer, hover image-swap/zoom on cards,
quick-add, elegant pagination/“load more”, empty states.

### FE-4 — Product Detail
Gallery (large imagery, thumbnail rail, zoom), refined variant selector,
fly-to-cart animation, accordion details, related products.

### FE-5 — Cart & Wishlist
Slide-over cart drawer + full cart page, luxury line items, sticky summary,
wishlist grid with move-to-cart. (Wires to existing actions unchanged.)

### FE-6 — Auth & Account
Editorial split-screen login/register, account dashboard shell, profile,
addresses, order history / tracking timeline UI.

### FE-7 — Checkout
Multi-step luxury checkout (address → shipping → payment → review),
progress indicator, order summary, confirmation screen. (UI only; payment wiring is backend Phase 5.)

### FE-8 — Admin Dashboard
Refined admin shell, data tables, product/order/coupon management UI,
analytics cards/charts styled to the system.

### FE-9 — Polish & QA
Micro-interactions, loading skeletons, 404/403/empty states, reduced-motion support,
responsive sweep, Lighthouse + a11y (WCAG AA) pass.

---

## Constraints honored every phase
- Touch only `src/components/**`, `src/app/**` (markup/styling), `globals.css`, `tailwind.config.ts`, `layout.tsx`.
- Never modify `src/server/**`, `src/lib/auth*`, `src/middleware.ts`, `prisma/**`, `src/schemas/**`.
- Each phase ends green: `tsc`, `lint`, `build`, runtime smoke test, then commit.
