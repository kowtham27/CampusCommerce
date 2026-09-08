# Campus Commerce

**Your Campus. Your Marketplace.**

A private university marketplace where verified students buy, sell, rent, and exchange
textbooks, electronics, and everyday campus items — built as a full-stack Next.js app.

## Project Overview

Campus Commerce connects students who have items they no longer need with students who
need them, without leaving campus. Every account is gated behind a college email domain,
and every listing supports one or more of three transaction types: **sell**, **rent**, and
**exchange**.

## Features

- Email-domain-gated registration with OTP verification
- Personalized dashboard (recommended / trending / recent / nearby)
- Full-text-style search with suggestions, filters, and shareable URL state
- Product details with image gallery, seller trust score, and reviews
- **Sell flow**: multi-step listing wizard with a rule-based "Smart Price Suggestion"
- **Buy flow**: Buy Now, Make an Offer (accept / reject / counter), Orders with pickup tracking
- **Rent flow**: daily/weekly/monthly pricing, deposits, request → approve → return
- **Exchange flow**: barter requests with accept/reject and item matching
- Real-time-style chat between buyers and sellers, tied to a listing
- Wishlist, notifications, reviews & ratings, reporting/moderation
- Sustainability ("Campus Impact") and trust-score estimates
- Full admin dashboard: metrics, moderation queue, user & listing management
- Fully responsive, with mobile bottom navigation and desktop nav

## Tech Stack

- **Framework**: Next.js (App Router) + TypeScript + React
- **Styling**: Tailwind CSS v4 + hand-rolled Radix-based UI primitives (shadcn-style)
- **Animation**: Framer Motion (respects `prefers-reduced-motion`)
- **Icons**: Lucide
- **Database**: PostgreSQL via **Supabase** (see `instruction.md`)
- **ORM**: Prisma
- **Auth**: Custom college-email + password + OTP flow, signed JWT session cookies (`jose`),
  edge middleware for route protection — no third-party auth vendor required

## Architecture

```
src/
├── app/              # Routes (App Router) — pages + API routes
│   ├── (app)/        # Authenticated marketplace shell (navbar + bottom nav)
│   ├── admin/         # Admin dashboard shell
│   ├── api/            # Route handlers (auth, products, offers, rentals, ...)
│   └── login|register|verify|onboarding|forgot-password/
├── components/        # Reusable UI (ui/ = design-system primitives)
├── services/          # Business logic, isolated from route handlers
│   ├── authService, productService, messagingService, ...
│   ├── pricingService        # rule-based "AI" price estimator
│   ├── recommendationService # rule-based recommendation engine
│   └── storageService        # image storage abstraction (placeholder ↔ Supabase Storage)
├── lib/               # prisma client, session/auth helpers, zod schemas, constants
└── middleware.ts       # route protection (session + admin-only routes)
prisma/
├── schema.prisma
└── seed.ts             # 30 users, 50+ products, orders, offers, reviews, notifications
```

Every backend feature that would normally require external infrastructure (image hosting,
transactional email) is behind a small `services/*Service.ts` abstraction with a working
demo fallback, so nothing in the UI is a dead button — see `services/storageService.ts` and
`services/authService.ts`'s OTP handling for examples.

## Database Setup

This app is configured for **Supabase Postgres**. Full step-by-step instructions —
creating a project, getting connection strings, pushing the schema, seeding data, and
optionally enabling Supabase Storage for real photo uploads — are in **[instruction.md](./instruction.md)**.

Quick version:

```bash
cp .env.example .env      # fill in DATABASE_URL / DIRECT_URL from Supabase
npx prisma generate
npx prisma db push
npm run db:seed
```

## Environment Variables

See `.env.example` for the full list. Required:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Pooled Postgres connection string (Supabase) |
| `DIRECT_URL` | Direct connection string, used for migrations |
| `SESSION_SECRET` | Signs session JWTs — generate with `openssl rand -base64 32` |
| `ALLOWED_EMAIL_DOMAIN` | Only emails ending in this domain can register (no real university is hard-coded) |
| `NEXT_PUBLIC_APP_URL` | Base URL, used for metadata |

Optional (enables real photo uploads instead of placeholders):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Installation

```bash
npm install
cp .env.example .env   # then fill in real values, see instruction.md
npx prisma generate
npx prisma db push
npm run db:seed
```

## Development

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Production Build

```bash
npm run build
npm run start
```

## Demo Accounts

Seeded by `prisma/seed.ts` (password for both: `CampusDemo123!`):

| Role | Email |
|---|---|
| Student | `student@university.edu` |
| Admin | `admin@university.edu` |

The login page has one-click buttons to fill these in. Registration OTPs are shown directly
in the UI (toast) in this demo since no transactional email provider is configured —
see `services/authService.ts`.

## Future Improvements

- Real-time chat via WebSockets (the schema and API already separate cleanly for this — see `services/messagingService.ts`)
- ML-based price suggestions and recommendations (both services expose a stable function
  signature specifically so a model can be swapped in without touching callers)
- Payment integration for in-app settlement
- Push notifications
- Transactional email for OTPs and order updates
