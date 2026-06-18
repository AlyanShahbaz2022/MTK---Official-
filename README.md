# MTK — E-Commerce Clothing Platform

Production-grade clothing storefront for Men, Women & Kids. Built with Next.js (full-stack), PostgreSQL + Prisma, Auth.js, Stripe, and an edenrobe-inspired design system.

See [project.md](project.md) for the full spec and [phases.md](phases.md) for the build roadmap.

## Tech Stack

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS + design tokens (Montserrat, monochrome palette) + Framer Motion
- **Database:** PostgreSQL + Prisma ORM (Neon / Supabase)
- **Auth:** Auth.js (NextAuth v5) — Credentials + Google, JWT in HttpOnly cookies, bcrypt
- **Payments:** Stripe
- **Images:** Cloudinary
- **State:** Zustand + TanStack Query
- **Validation:** Zod

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local   # then fill in real values

# 3. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Lint |
| `npm run typecheck` | Type-check without emitting |
| `npm run format` | Format with Prettier |
| `npm run db:migrate` | Run Prisma migrations (Phase 1+) |
| `npm run db:studio` | Open Prisma Studio (Phase 1+) |

## Project Structure

```
src/
├─ app/            # routes (App Router) + api route handlers
├─ components/     # ui + feature components
├─ lib/            # utils, env, (later) prisma/auth/stripe clients
└─ ...
```

## Status

**Phase 0 complete** — tooling, design system, and a styled landing placeholder. Next: Phase 1 (database & domain model). See [phases.md](phases.md).
