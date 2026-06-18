# MTK E-Commerce — Build Roadmap (phases.md)

> A step-by-step plan to build the MTK clothing brand e-commerce platform described in [project.md](project.md), to a production, Zara/H&M-level standard.

---

## Decisions (locked)

| Area | Choice | Why |
|------|--------|-----|
| **Architecture** | **Next.js full-stack** (App Router) — UI + Route Handlers (`/app/api`) + Prisma in one codebase | Fewer moving parts, one deployment, faster to ship. Server logic lives in Route Handlers + Server Actions instead of a separate Express server. |
| **Database** | **PostgreSQL + Prisma ORM**, hosted on **Neon** (or Supabase) | Relational data (orders, inventory, line items) fits Postgres. Free serverless tier, no local DB needed. |
| **Auth** | **Auth.js (NextAuth v5)** with Credentials + Google providers, JWT in **HttpOnly cookies**, **bcrypt** hashing | Matches spec's JWT + HttpOnly + Google requirements without hand-rolling session security. |
| **Payments** | **Stripe first** (test mode), JazzCash/EasyPaisa later | Best test tooling and docs. |
| **Images** | **Cloudinary** (signed uploads) | Off-server storage, type/size restrictions, CDN delivery. |
| **Styling** | **Tailwind CSS + shadcn/ui + Framer Motion** | Production-grade component base + animations. |
| **Validation** | **Zod** everywhere (forms + API boundaries) | Single source of truth for input validation. |
| **State** | **Zustand** (cart/wishlist client state) + **TanStack Query** (server data) | Lightweight, well-supported. |

> Note: This replaces the spec's "separate Express API" with Next.js Route Handlers. Every security requirement in project.md §6 is still met — just implemented inside Next.js middleware/handlers rather than Express.

---

## Target folder structure

```
Website/
├─ project.md
├─ phases.md
├─ .env.local                # secrets (gitignored)
├─ .env.example              # committed template
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ public/
├─ src/
│  ├─ app/
│  │  ├─ (shop)/             # storefront routes
│  │  ├─ (auth)/             # login/register
│  │  ├─ admin/              # admin dashboard (RBAC-gated)
│  │  └─ api/                # route handlers (REST)
│  ├─ components/            # ui + feature components
│  ├─ lib/                   # prisma client, auth, stripe, cloudinary, utils
│  ├─ server/                # services, data-access, server actions
│  ├─ schemas/               # Zod schemas
│  ├─ store/                 # Zustand stores
│  └─ middleware.ts          # auth + security headers + rate limit
└─ ...config files
```

---

## Phase 0 — Foundations & Tooling
**Goal:** A running, well-configured empty app.

- Scaffold Next.js (TypeScript, App Router, Tailwind, ESLint) into this folder.
- Add Prettier, `.editorconfig`, strict `tsconfig`, absolute imports (`@/*`).
- Install core deps: `prisma`, `@prisma/client`, `zod`, `next-auth@beta`, `bcryptjs`, `zustand`, `@tanstack/react-query`, `framer-motion`, `stripe`, `cloudinary`, `@upstash/ratelimit`.
- Set up shadcn/ui.
- Create `.env.example` + `.gitignore` (ensure `.env*` ignored — spec §6.10).
- Git init + first commit.

**Done when:** `npm run dev` serves a styled landing placeholder with no type/lint errors.

---

## Phase 1 — Database & Domain Model
**Goal:** Full relational schema, migrated and seeded.

Expand the spec's 3-table sketch (§7) into a complete model:

- **User** (id, name, email, passwordHash, role[USER/ADMIN], image, addresses[], timestamps)
- **Address** (linked to User; shipping/billing)
- **Product** (id, name, slug, description, basePrice, category, gender, rating, isActive)
- **ProductVariant** (size, color, sku, stock, priceOverride) — needed for size/color filtering
- **ProductImage** (url, alt, position, Cloudinary publicId)
- **Category** (hierarchical: Men/Women/Kids → subcategories)
- **Cart** + **CartItem** (variant, qty) — persisted per user
- **Wishlist** + **WishlistItem**
- **Order** + **OrderItem** (snapshot of price/name at purchase) + status enum + paymentStatus enum
- **Review** (rating, body, userId, productId; one per user/product)
- **Coupon** (code, type, value, expiry, usage limits)
- **AuditLog** (admin actions, login attempts — spec §6.13)

Tasks: write `schema.prisma`, run first migration on Neon, build a `seed.ts` with demo categories/products/admin user, create singleton Prisma client in `src/lib/prisma.ts`.

**Done when:** `npx prisma migrate dev` + `npx prisma db seed` succeed; data visible in `npx prisma studio`.

---

## Phase 2 — Authentication & RBAC
**Goal:** Secure register/login/logout + role gating. *(Spec §6.4, §6.5, §6.8, §6.9)*

- Configure Auth.js: Credentials provider (bcrypt verify) + Google OAuth.
- JWT session strategy, HttpOnly + Secure + SameSite cookies.
- Register/login pages with Zod-validated forms; password strength policy.
- `middleware.ts`: protect `/admin/*` (ADMIN only) and `/account/*` (authenticated).
- Login attempt rate limiting (Upstash) + audit logging.
- Session expiry / auto-logout handling.

**Done when:** A user can register, log in (credentials + Google), reach `/account`; non-admins get 403 on `/admin`; brute-forcing login is throttled.

---

## Phase 3 — Product Catalog & Browsing
**Goal:** The shopping storefront. *(Spec §5 user features)*

- Home page (hero, featured products, category cards) with Framer Motion.
- Category/listing pages with **filters**: price range, category, size, color, gender + sorting + pagination (server-side via Route Handlers).
- Product detail page: image gallery, variant selector (size/color), stock state, reviews summary, related products.
- Search.
- `next/image` optimization, lazy loading, SSR/streaming.

**Done when:** Users browse, filter, and open product pages backed by seeded DB data; Lighthouse perf ≥ 90.

---

## Phase 4 — Cart & Wishlist
**Goal:** Add-to-cart and save-for-later. *(Spec §5)*

- Zustand cart store with optimistic UI; sync to DB `Cart` for logged-in users; merge guest cart on login.
- Cart drawer/page: qty update, remove, live totals, stock checks.
- Wishlist add/remove + move-to-cart.

**Done when:** Cart persists across refresh and login; quantities respect stock.

---

## Phase 5 — Checkout & Payments (Stripe)
**Goal:** Working purchase flow. *(Spec §5, payment gateway)*

- Multi-step checkout: address → review → pay.
- Server-side order creation with price re-validation (never trust client totals).
- **Stripe** Checkout/Payment Intents in test mode; webhook handler to confirm payment → mark order `PAID`, decrement stock atomically.
- Coupon application (validate code, apply discount server-side).
- Order confirmation page + email (Resend, optional).

**Done when:** A test card completes a purchase, stock decrements, order appears in user's history with correct status.

---

## Phase 6 — User Account & Reviews
**Goal:** Post-purchase experience. *(Spec §5)*

- Account dashboard: profile edit, address book, order history + **order tracking** (status timeline).
- Reviews & ratings: only verified purchasers can review; aggregate rating on product.

**Done when:** Users manage their profile, track orders, and leave reviews that update product ratings.

---

## Phase 7 — Admin Dashboard
**Goal:** Full business control. *(Spec §5 admin features)*

- RBAC-gated `/admin` layout.
- Product CRUD + variant/inventory management + **Cloudinary** image upload (signed, type/size restricted — spec §6.6).
- Order management (status updates, refunds).
- User management.
- Coupon management.
- Analytics dashboard (sales, top products, revenue charts).
- Admin activity audit log view (§6.13).

**Done when:** An admin can manage the entire catalog, orders, users, and coupons end-to-end.

---

## Phase 8 — Security Hardening
**Goal:** Tick every box in project.md §6.

- **Helmet-equivalent headers** via `next.config` / middleware: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy (§6.12).
- **CSRF**: Auth.js built-in tokens + origin validation on mutations (§6.3).
- **XSS**: sanitize rich text, no `dangerouslySetInnerHTML` without sanitizer (§6.2).
- **Rate limiting** across sensitive APIs (Upstash) (§6.7).
- **Zod** validation enforced on every Route Handler (§6.7).
- SQL injection: Prisma-only, no raw queries (§6.1).
- Secrets audit, `.env` never exposed, no secrets in client bundle (§6.10).
- Logging/monitoring wired up (§6.13).

**Done when:** A security checklist mapping each §6 item to its implementation is complete; `npm audit` clean; headers verified.

---

## Phase 9 — Testing & QA
**Goal:** Confidence to ship.

- Unit tests (Vitest) for utils, schemas, pricing/coupon logic.
- Integration tests for auth + checkout Route Handlers.
- E2E (Playwright): register → browse → cart → checkout → order.
- Accessibility pass + responsive QA (mobile-first).

**Done when:** Core flows are covered by green tests; manual mobile QA passes.

---

## Phase 10 — Deployment & Launch
**Goal:** Live, secure, fast. *(Spec §9)*

- Deploy to **Vercel**; production env vars set.
- **Neon/Supabase** production DB + run migrations.
- **Cloudflare** in front (CDN, WAF, DDoS, bot filtering — spec §6.11).
- Stripe live keys + production webhook.
- Custom domain + SSL, analytics, error monitoring (Sentry).

**Done when:** Public URL serves the live store with payments working in production.

---

## Sequencing & dependencies

```
0 → 1 → 2 → 3 → 4 → 5 → 6 → 7
                          ↘ 8 (overlaps from Phase 2 onward; finalized after 7)
                            9 → 10
```

Phases 0–5 form the **MVP** (a customer can buy a product). Phases 6–7 complete the product. Phases 8–10 harden and ship. Security (§8) is applied incrementally during each phase, then audited as a dedicated pass.

---

## Suggested first command (Phase 0 kickoff)

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

(Run inside this `Website/` folder; the existing `.md` files stay untouched.)
