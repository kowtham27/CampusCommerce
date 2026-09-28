# Campus Commerce

**Your Campus. Your Marketplace.**

A private university marketplace where verified students buy, sell, rent, and exchange
textbooks, electronics, and everyday campus items.

## Project Overview

Campus Commerce connects students who have items they no longer need with students who
need them, without leaving campus. Every account is gated behind a college email domain,
and every listing supports one or more of three transaction types: **sell**, **rent**, and
**exchange**.

## Features

- Email-domain-gated registration with OTP verification
- Personalized dashboard (recommended / trending / recent / nearby)
- Search with filters and shareable URL state
- Product details with image gallery, seller trust score, and reviews
- **Sell flow**: multi-step listing wizard with photo uploads and a rule-based "Smart Price Suggestion"
- **Buy flow**: Buy Now, Cart with per-seller checkout, Make an Offer (accept / reject / counter), Orders with pickup tracking
- **Rent flow**: daily/weekly/monthly pricing, deposits, request → approve → return
- **Exchange flow**: barter requests with accept/reject
- Buyer–seller chat tied to a listing
- Wishlist, notifications, reviews & ratings, reporting/moderation
- Sustainability ("Campus Impact") and trust-score estimates
- Admin dashboard: metrics, moderation queue, user & listing management
- Fully responsive, with dark/light theme

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router) + React 19 + TypeScript, Tailwind CSS v4, Radix UI, Framer Motion |
| Backend | **Express 5** (Node.js) + TypeScript, Zod validation, Multer uploads |
| Database | **PostgreSQL 16** (Docker) via Prisma ORM, with versioned migrations |
| Auth | College email + password + OTP; signed JWT (`jose`) in an httpOnly session cookie, bcrypt password hashes |

## Architecture

```
campus-commerce/
├── docker-compose.yml     # PostgreSQL 16
├── backend/               # Express REST API — owns the database
│   ├── prisma/
│   │   ├── schema.prisma  # users, products, orders, offers, rentals, exchanges, chat, ...
│   │   ├── migrations/    # versioned SQL migrations
│   │   └── seed.ts        # 29 users, 55 products, orders, offers, reviews, notifications
│   └── src/
│       ├── server.ts      # entry point
│       ├── app.ts         # middleware stack + route mounting
│       ├── config/env.ts  # typed environment config
│       ├── middleware/    # session → user loading, requireUser/requireAdmin, error handler
│       ├── routes/        # one router per resource (auth, products, cart, orders, ...)
│       ├── services/      # business logic (recommendations, trust score, messaging, ...)
│       └── lib/           # prisma client, session cookies, zod schemas, HTTP helpers
└── frontend/              # Next.js UI — never touches the database
    └── src/
        ├── app/           # pages (App Router)
        ├── components/    # UI components (ui/ = design-system primitives)
        ├── lib/api.ts     # server-side API client (forwards the session cookie)
        ├── proxy.ts       # redirects signed-out visitors away from app pages
        └── types/         # API response types
```

**How the two halves talk.** Next.js rewrites `/api/*` and `/uploads/*` to the Express
server, so browser requests stay same-origin and the session cookie works without CORS.
Server Components call the backend directly through `lib/api.ts`, forwarding the visitor's
cookie. The backend is the single source of truth for authentication and authorization:
it verifies the session on every request and enforces who may do what.

## API Overview

All endpoints are under `/api` and return JSON (`{ "error": "..." }` on failure).

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register` · `/auth/verify` · `/auth/login` · `/auth/logout` · `/auth/resend-otp` · `/auth/forgot-password` · `/auth/reset-password` |
| Account | `GET /me` · `/me/collections` · `/me/nav` · `/me/listings` · `POST /onboarding` · `PATCH /settings/{account,password,preferences}` · `POST /settings/logout-all` |
| Catalog | `GET /categories` · `/locations` · `/stats/landing` (public) |
| Products | `GET /products?q=&category=&type=&condition=&minPrice=&maxPrice=&sort=` · `/products/feed` · `/products/:id` · `/products/:id/similar` · `POST /products` · `POST /products/:id/view` · `PATCH /products/:id` |
| Users | `GET /users/:id/profile` · `/users/:id/stats` (`:id` may be `me`) |
| Shopping | `GET/POST/DELETE /wishlist` · `GET/POST/DELETE /cart` · `POST /cart/checkout` |
| Orders | `GET /orders` · `POST /orders` · `PATCH /orders/:id` |
| Offers | `GET /offers` · `POST /offers` · `PATCH /offers/:id` (accept / reject / counter) |
| Rentals | `GET /rentals` · `POST /rentals` · `PATCH /rentals/:id` |
| Exchanges | `GET /exchanges` · `POST /exchanges` · `PATCH /exchanges/:id` |
| Messaging | `GET /conversations` · `GET /conversations/:id` · `POST /conversations` · `POST /conversations/:id/messages` |
| Notifications | `GET /notifications` · `POST /notifications/:id/read` · `POST /notifications/read-all` |
| Trust | `POST /reviews` · `POST /reports` |
| Uploads | `POST /uploads` (multipart `photos`, up to 6 images × 5 MB) → `{ urls }`, served at `/uploads/*` |
| Admin | `GET /admin/stats` · `/admin/users?q=` · `/admin/listings` · `/admin/reports` · `PATCH /admin/users/:id` · `PATCH /admin/reports/:id` |

## Getting Started

**Prerequisites:** Node.js 20+ and Docker Desktop (or any PostgreSQL 14+ server).

```bash
# 1. Install dependencies (root, backend and frontend)
npm run setup

# 2. Configure environment
cp backend/.env.example backend/.env           # set SESSION_SECRET
cp frontend/.env.example frontend/.env.local

# 3. Start PostgreSQL, create the schema and load demo data
docker compose up -d db
npm run db:migrate
npm run db:seed

# 4. Run backend (http://localhost:4000) and frontend (http://localhost:3000) together
npm run dev
```

**Port already in use?** Everything is configurable. For example, to run Postgres on 5434
and the API on 4100:

```bash
DB_PORT=5434 docker compose up -d db
# backend/.env:        PORT=4100 and DATABASE_URL=...@localhost:5434/...
# frontend/.env.local: BACKEND_URL="http://localhost:4100"
```

## Environment Variables

**`backend/.env`**

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Signs session JWTs — generate with `openssl rand -base64 32` (required in production) |
| `ALLOWED_EMAIL_DOMAIN` | Only emails ending in this domain can register |
| `PORT` | API port (default `4000`) |
| `FRONTEND_URL` | Frontend origin allowed by CORS (default `http://localhost:3000`) |
| `UPLOAD_DIR` | Where listing photos are stored (default `uploads`) |

**`frontend/.env.local`**

| Variable | Purpose |
|---|---|
| `BACKEND_URL` | Where the Express API runs (default `http://localhost:4000`) |
| `ALLOWED_EMAIL_DOMAIN` | Shown in registration hints; keep in sync with the backend |

## Scripts (from the repo root)

| Command | What it does |
|---|---|
| `npm run dev` | Backend + frontend in watch mode |
| `npm run build` | Compile the backend and build the frontend |
| `npm run start` | Run both production builds |
| `npm run db:migrate` | Apply Prisma migrations (creates new ones in development) |
| `npm run db:seed` | Load demo data |
| `npm run db:studio` | Browse the database in Prisma Studio |

## Demo Accounts

Seeded by `backend/prisma/seed.ts` (password for both: `CampusDemo123!`):

| Role | Email |
|---|---|
| Student | `student@university.edu` |
| Admin | `admin@university.edu` |

Registration OTPs are shown directly in the UI in this demo, since no transactional email
provider is configured — see `backend/src/services/authService.ts`.

## Future Improvements

- Real-time chat via WebSockets
- ML-based price suggestions and recommendations (both expose stable function signatures so a model can be swapped in)
- Payment integration for in-app settlement
- Object storage (S3 / Cloudinary) for uploads in multi-instance deployments
- Transactional email for OTPs and order updates
