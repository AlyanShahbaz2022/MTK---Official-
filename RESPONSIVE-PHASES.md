# MTK — Responsive Design Phases

A phased plan to make the entire MTK site look and work well on **all devices**: small
phones (320–390px), large phones, tablets (768–1024px), laptops, and large desktops.

> **Why phased:** responsiveness touches almost every component. Doing it in gated phases
> keeps each change reviewable, lets us verify on real breakpoints before moving on, and
> avoids a giant unreviewable diff. Each phase ends with a **verification checklist**.

---

## Current state (audit summary)

What we already have:

- **Storefront** uses Tailwind responsive utilities widely (`sm:`/`md:`/`lg:`/`xl:` across
  ~39 files). The site header already has a **working mobile drawer** (hamburger → slide-in
  menu, `md:hidden`).
- Tailwind's **default breakpoints** apply: `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`.
  (The `xs`/`2xl` keys in `tailwind.config.ts` are the font-size/spacing scale, **not**
  breakpoints — there is no custom `xs` breakpoint yet.)

The biggest gaps:

- **Admin panel** is saturated with **fixed pixel values** (`[20px]`, `[42px]`, `[256px]`…) —
  e.g. ~32 in `admin/page.tsx`, ~43 in `admin/homepage`, ~18 in `admin/customers`. These do
  not adapt and will overflow / cramp on phones.
- **Wide admin tables** (orders, products, customers) use `min-w-[760px]+` and will force
  horizontal scrolling or break layout on small screens.
- Storefront pages use responsive classes but have **not been verified** at 320–390px;
  expect overflow, oversized headings, tap-target, and image-ratio issues.
- No defined **breakpoint strategy**, no shared responsive primitives (container, section
  spacing), and no test matrix.

---

## Target device matrix

| Tier            | Width        | Representative devices                 |
| --------------- | ------------ | -------------------------------------- |
| Small phone     | 320–374px    | iPhone SE, small Android               |
| Phone           | 375–429px    | iPhone 14/15, Pixel                    |
| Large phone     | 430–639px    | iPhone Pro Max                         |
| Tablet portrait | 640–1023px   | iPad portrait                          |
| Laptop          | 1024–1439px  | most laptops                           |
| Desktop         | 1440px+      | large monitors                         |

**Primary rule:** mobile-first. Base styles target small phones; layer larger layouts with
`sm: md: lg: xl:`.

---

## Phase 0 — Foundations & strategy (no visual rebuild) ✅ DONE

Set the groundwork so later phases are consistent and fast.

- [x] Documented the **breakpoint convention** (mobile-first) in `tailwind.config.ts`.
- [x] Added a custom **`xs` breakpoint (400px)** for small phones (Tailwind `screens.xs`).
- [x] Added shared **layout primitives** — `Container` (max-width + fluid padding
      `px-4 sm:px-6 lg:px-8`, sizes sm/md/lg/xl/full) and `Section` (responsive vertical
      rhythm) in `src/components/ui/container.tsx`.
- [x] Set a **fluid base type scale** in `globals.css` (15px on phones → 16px from `sm`),
      plus `-webkit-text-size-adjust` and `overflow-wrap` so headings/URLs don't overflow.
- [x] Added explicit **`viewport` export** in `src/app/layout.tsx`
      (`width=device-width, initialScale=1, viewport-fit=cover`, theme-color).
- [x] Global **no horizontal scroll** safety net (`overflow-x: hidden` on html/body) +
      responsive media (`img/video/svg/canvas { max-width:100% }`).
- [x] Added utilities: `.pb-safe/.pt-safe/.px-safe` (safe-area insets) and `.no-scrollbar`
      (for mobile filter/tab rails in later phases).
- [x] Validated by adopting `Container` in `wishlist/page.tsx` (no desktop regression).

**Verify:** ✅ primitives exist and are used by a sample page; typecheck clean; site loads.

**For later phases — use these instead of ad-hoc classes:**

```tsx
import { Container, Section } from '@/components/ui/container';

<Container size="lg">           {/* mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 */}
  <Section spacing="md">…</Section>
</Container>
```

---

## Phase 1 — Global layout & navigation ✅ DONE

The frame that wraps every page.

- [x] **Storefront header**: tightened gutters for phones (`px-4 sm:px-6 md:px-10`), height
      `h-16` on mobile → `h-20` from `sm`, logo shrinks (`text-2xl`/`tracking-[0.2em]` →
      `xs:text-3xl`/`0.3em`) so it fits at 320px. Mobile drawer already present + verified.
- [x] **Search**: field width is now fluid via a CSS var (`120px` phone → `160px` xs →
      `200px` sm) instead of a fixed `180px` that overflowed small screens.
- [x] **Footer** (`site-footer.tsx`): gutters `px-4 sm:px-6 md:px-10`, tighter mobile padding,
      bottom bar centers on mobile. (Columns already 2-up → 4-up.)
- [x] **Account layout** + **AccountNav**: nav is now a **horizontal scroll tab strip** on
      mobile (bottom-border active state, `.no-scrollbar`) and a **vertical sidebar** at `lg`
      (left-border). Layout gutters + heading scale made responsive via `Container`.
- [x] **Auth layout**: form-panel padding + logo scale tuned for phones (image panel already
      `hidden lg:block`).
- [x] **Global no-horizontal-scroll** handled in Phase 0; checkout page adopts `Container`.

**Verify:** ✅ tsc clean; home, login (auth layout), checkout, and account all render 200;
no compile errors on hot-reload.

---

## Phase 2 — Storefront: home & content pages ✅ DONE

The marketing surfaces (highest traffic, most imagery).

- [x] **Hero / banner carousel**: gutters `px-4 sm:px-6 md:px-10`, content bottom padding
      reduced on phones (`pb-24` → `pb-32`), title scales `text-4xl xs:5xl sm:6xl md:7xl`,
      eyebrow/subtitle/CTA tuned for small screens. Arrows + dots already reachable.
- [x] **new-in / category-grid / promo-duo / editorial-split / service-strip**: standardized
      to `px-4 sm:px-6 md:px-10` gutters and `py-14 sm:py-20 md:py-28` vertical rhythm;
      section headings shrink one step on phones (`text-2xl/3xl sm:…`). Grids already stack
      1-col → 2/3/4-col with correct image `sizes` and aspect ratios.
- [x] **Editorial split**: mobile gap reduced (`gap-8 sm:gap-12`).
- [x] **Marquee**: already responsive (`text-4xl md:text-6xl`, overflow-hidden) — left as is.

**Verify:** ✅ tsc clean; home renders 200; all home sections hot-reloaded without errors.

---

## Phase 3 — Storefront: catalog (listing, filters, product card)

Shopping/browse experience.

- [ ] **Product grid** (`product-grid.tsx` / `product-listing.tsx`): 2-up on phones, scaling to
      3–4 columns on larger screens; consistent card heights.
- [ ] **Product card** (`product-card.tsx` / `mini-product-card.tsx`): image ratio, price/title
      truncation, tap target for the whole card.
- [ ] **Filters** (`product-filters.tsx`): collapse into a **bottom-sheet / drawer** on mobile
      (filters are unusable as a fixed sidebar on phones); sort control accessible.
- [ ] Pagination / "load more" reachable and thumb-friendly.

**Verify:** /shop /men /women /kids browse + filter + sort works on a phone.

---

## Phase 4 — Storefront: product detail page

- [ ] **Gallery** (`product-gallery.tsx`): swipeable/stacked images on mobile, thumbnails wrap;
      main image uses a sensible aspect ratio (no letterboxing).
- [ ] **Variant selector** (`variant-selector.tsx`): size/color chips wrap; buttons ≥ 44px.
- [ ] Buy box (price, add-to-cart, wishlist) **sticky or clearly reachable** on mobile.
- [ ] **Reviews** (`product-reviews.tsx`), **you-may-also-like**, **recently-viewed**: carousels
      or stacks that don't overflow.

**Verify:** full PDP (view → pick variant → add to cart) is smooth on a phone.

---

## Phase 5 — Cart, wishlist & checkout

Conversion-critical; must be flawless on mobile.

- [ ] **Cart** (`cart/page.tsx`, `cart-line.tsx`, `cart-summary.tsx`): line items stack;
      quantity controls thumb-friendly; summary moves below items on mobile, sticky on desktop.
- [ ] **Wishlist** (`wishlist/page.tsx`, `wishlist-item.tsx`): responsive grid/list.
- [ ] **Checkout** (`checkout-form.tsx`): the two-column (form + summary) collapses to a single
      column on mobile with summary either on top or in a collapsible panel; the **EasyPaisa
      panel + screenshot upload** is fully usable on a phone. (Checkout text was already enlarged.)
- [ ] **Order success + order detail + order history**: receipts/timelines readable on phones.

**Verify:** complete a COD **and** an EasyPaisa checkout end-to-end on a phone-width viewport.

---

## Phase 6 — Admin panel (the biggest lift)

Currently desktop-only with fixed-pixel layout. Make it usable on tablet/phone.

- [ ] **Admin shell** (`admin-shell.tsx`): sidebar already has a mobile drawer — verify topbar,
      search, profile menu, and content padding adapt; replace rigid fixed widths where they
      cause overflow.
- [ ] **Convert fixed `[NNpx]` utilities** to responsive scales on the heavy pages
      (`admin/page.tsx`, `homepage`, `customers`, `analytics`, `settings`) — at least fluid
      padding/gaps and stackable grids.
- [ ] **Tables → responsive** (orders, products, customers, payments): on phones, either
      (a) wrap in a horizontal-scroll container with a sticky first column, or (b) switch to a
      **stacked card layout** per row. Pick one pattern and apply consistently.
- [ ] **Dashboard** stat cards + charts: 1-col on phones, 2-col `sm`, 4-col `xl`; charts shrink.
- [ ] **Modals** (`modal.tsx`) and **forms** (product/category editors): full-width, scrollable,
      keyboard/upload friendly on mobile.
- [ ] **Payment review cards**: screenshot + actions stack on small screens.

**Verify:** an admin can review an order, edit a product, and verify a payment from a phone.

---

## Phase 7 — Cross-cutting polish & QA

Final hardening across the whole app.

- [ ] **Tap targets**: all interactive elements ≥ 44×44px on touch.
- [ ] **Typography**: no headline overflows; balanced line lengths; readable body sizes.
- [ ] **Images**: correct `sizes`/aspect ratios everywhere; no layout shift (CLS).
- [ ] **Landscape phones** and **foldables** sanity check.
- [ ] **Safe areas / notches** (`env(safe-area-inset-*)`) for sticky bars if needed.
- [ ] **Accessibility**: focus states visible, drawers trap focus, `prefers-reduced-motion`.
- [ ] Full pass on the **device matrix** for every key route.

**Verify:** sign-off run through the matrix; no horizontal scroll, no clipping, no tiny taps.

---

## Suggested order & gating

1. **Phase 0** (foundations) → unblocks everything.
2. **Phases 1–5** (storefront, customer-facing) → highest user impact.
3. **Phase 6** (admin) → biggest effort, internal users.
4. **Phase 7** (polish/QA) → final sign-off.

Each phase is independently shippable. Recommend verifying on the device matrix at the end of
each phase before starting the next.

## How to verify (per phase)

- Chrome/Edge DevTools device toolbar at: **320, 375, 430, 768, 1024, 1440px**.
- Toggle a real phone via the dev server network URL if available.
- Watch for: horizontal scrollbars, clipped text, overlapping elements, tiny tap targets,
  broken image ratios, and unreachable controls.
