# LUXE — Premium eCommerce Starter

A production-oriented eCommerce foundation built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma/PostgreSQL**, **Zustand**, and **Stripe**. Premium, minimal, Apple/Nike-inspired UI with dark/light mode, smooth Framer Motion animations, and full SEO.

> **Runs with zero configuration.** The storefront browses, filters, carts, and "checks out" entirely on bundled mock data — no database, Stripe, or auth keys required. Add environment variables to progressively light up real persistence and payments.

---

## What's included

### Storefront (fully working on mock data)
- **Home** — hero, categories, featured products, promo/flash-sale banner, best sellers, testimonials, newsletter.
- **Shop** — server-rendered search, category/brand/rating filters, sorting, pagination (all URL-driven).
- **Product** — image gallery with hover-zoom, variant/color/size selectors, quantity stepper, stock status, add-to-cart, buy-now, wishlist, specs, reviews, related products, JSON-LD structured data.
- **Cart** — quantity editing, remove, coupon codes (`WELCOME10`, `SAVE20`), shipping estimate, tax, totals.
- **Checkout** — multi-step (shipping → payment → review) with React Hook Form + Zod; posts to the checkout API and falls back to a simulated success when Stripe isn't configured.
- **User dashboard** — overview, order history, wishlist, addresses, payment methods, settings (theme).
- **Admin dashboard** — analytics with a dependency-free SVG sales chart, orders, products (CRUD UI), customers, coupons, inventory, reviews, settings.

### Cross-cutting
- Dark/light mode (`next-themes`), sticky blurred navbar, responsive mobile menu.
- Toasts (`sonner`), loading skeletons, error boundary, 404, empty states.
- SEO: per-page metadata, Open Graph/Twitter, `sitemap.ts`, `robots.ts`.
- Zustand stores with `persist`: cart, wishlist, recently-viewed.
- Prices stored as **integer cents** everywhere to avoid floating-point errors.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router, React 18, TypeScript |
| Styling | Tailwind CSS, shadcn/ui-style primitives, CSS variable theming |
| Icons / Motion | Lucide React, Framer Motion |
| State | Zustand (+ persist) |
| Forms / Validation | React Hook Form, Zod |
| ORM / DB | Prisma, PostgreSQL |
| Payments | Stripe (Checkout Sessions + webhook) |
| Auth | Clerk **or** Auth.js (wiring documented below) |
| Images | Cloudinary (or any remote host; demo uses Unsplash) |

---

## Quick start

```bash
# 1. Install
npm install

# 2. Run the demo (no env needed)
npm run dev
# → http://localhost:3000
```

That's it for the demo. The catalog, cart, and checkout all work on mock data.

---

## Enabling the real backend

### 1. Environment variables
Copy the example file and fill in what you need:

```bash
cp .env.example .env
```

| Variable | Needed for |
|---|---|
| `DATABASE_URL` | Prisma / PostgreSQL |
| `NEXT_PUBLIC_APP_URL` | Absolute URLs (checkout redirects, sitemap) |
| `STRIPE_SECRET_KEY` | Live Stripe checkout |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification |
| `NEXT_PUBLIC_CLERK_*` / `CLERK_*` | Clerk auth (if used) |
| `CLOUDINARY_*` | Image uploads (if used) |

### 2. Database
```bash
npm run db:push      # create tables from schema.prisma
npm run db:seed      # load demo catalog, users, coupons
npm run db:studio    # browse data in Prisma Studio
```

Seed creates:
- Admin — `admin@luxe.example`
- Customer — `george@example.com` (with an address + reviews)
- Full catalog (products, variants, inventory) derived from `src/lib/mock-data.ts`
- Coupons `WELCOME10` and `SAVE20`

### 3. Swap mock data → Prisma
Every page reads through the **data-access layer** in `src/lib/data.ts`. It currently returns mock data; each function has a commented Prisma equivalent. Replace the bodies (e.g. `getFeaturedProducts`, `searchProducts`, `getProductBySlug`) with the Prisma queries and **no page or component needs to change** — they only depend on the function signatures and the framework-agnostic types in `src/lib/types.ts`.

### 4. Stripe
```bash
# Local webhook forwarding
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
Put the printed signing secret in `STRIPE_WEBHOOK_SECRET`. With `STRIPE_SECRET_KEY` set, `POST /api/checkout` creates a real Checkout Session and the client redirects to Stripe; the webhook (`src/app/api/webhooks/stripe/route.ts`) is where you mark orders paid, decrement inventory, and send email.

### 5. Authentication (Clerk or Auth.js)
`middleware.ts` ships as a pass-through that sets security headers, with a commented Clerk example. To protect routes:
- **Clerk:** install `@clerk/nextjs`, wrap the app in `<ClerkProvider>`, and enable `clerkMiddleware()` matching `/dashboard`, `/admin`, `/checkout`. Mirror the Clerk user into `User.externalId`.
- **Auth.js:** add a `[...nextauth]` route and gate the same paths in middleware.
Admin routes additionally require `role === "ADMIN"` (see the banner in `/admin`).

---

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` / `start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run db:push` | Push schema to DB |
| `npm run db:migrate` | Create a migration |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Prisma Studio |

---

## Project structure

```
prisma/
  schema.prisma        # 15 models, enums, indexes, relations
  seed.ts              # idempotent seed derived from mock-data
src/
  app/
    (storefront)       # page.tsx, shop, product/[slug], cart, checkout
    dashboard/         # account: orders, wishlist, addresses, settings…
    admin/             # analytics, products, orders, customers, coupons…
    api/               # checkout, webhooks/stripe, products, search, newsletter
    layout.tsx, sitemap.ts, robots.ts, error.tsx, not-found.tsx
  components/          # navbar, footer, product cards, galleries, charts, UI
  lib/                 # data.ts (DAL), mock-data, types, utils, validations, stripe, prisma
  store/               # cart, wishlist, recently-viewed (Zustand + persist)
```

---

## Theming
Colors are CSS HSL variables in `src/app/globals.css` (`:root` and `.dark`). Change the `--primary` / `--accent` tokens to re-skin the entire app. Tailwind maps these via `tailwind.config.ts`.

---

## Scope & honest status

This is a **strong, coherent foundation plus a clear roadmap** — not a fully-wired, multi-week platform. What's real and runnable today: the entire storefront, cart, multi-step checkout (simulated), dashboards, API routes, complete Prisma schema, and seed. What needs your keys/wiring to go live: swapping `data.ts` to Prisma, Stripe keys + webhook fulfillment, and an auth provider. Each of these has explicit instructions above and inline comments at the relevant call sites.

## License
MIT — use freely as a starting point.
