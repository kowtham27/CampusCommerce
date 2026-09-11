# Connecting Campus Commerce to Supabase

This project uses **Prisma ORM** talking to a **Supabase Postgres** database.
Supabase just hosts the Postgres instance — Prisma does all the schema/migrations/queries, so nothing else in the app needs to change.

---

## 1. Create a Supabase project

1. Go to https://supabase.com/dashboard and sign in.
2. Click **New Project**.
3. Fill in:
   - **Name**: `campus-commerce` (or anything you like)
   - **Database Password**: generate a strong one and **save it somewhere safe** — you'll need it in the connection string below.
   - **Region**: pick the one closest to you.
4. Wait ~2 minutes for the project to finish provisioning.

---

## 2. Get your connection strings

In your Supabase project: **Project Settings → Database → Connection string**.

Supabase gives you two kinds of connection strings — Prisma needs **both**:

| Purpose | Which one | Used for |
|---|---|---|
| `DATABASE_URL` | **Transaction pooler** (port `6543`, `?pgbouncer=true`) | Normal app queries at runtime (serverless-friendly, pooled) |
| `DIRECT_URL` | **Session/Direct connection** (port `5432`) | Running `prisma migrate` / `prisma db push` (migrations need a direct, non-pooled connection) |

Copy both, replacing `[YOUR-PASSWORD]` with your actual database password:

```
DATABASE_URL="postgresql://postgres.xxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-<region>.pooler.supabase.com:5432/postgres"
```

(Exact host/format may differ slightly depending on your Supabase project's region/setup — always copy from the dashboard rather than typing by hand.)

---

## 3. Set up your local `.env`

In the project root:

```bash
cp .env.example .env
```

Open `.env` and fill in:

```
DATABASE_URL="<paste the pooled connection string>"
DIRECT_URL="<paste the direct connection string>"

NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"
ALLOWED_EMAIL_DOMAIN="university.edu"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Never commit `.env` — it's already in `.gitignore`.

---

## 4. Point Prisma at Postgres

`prisma/schema.prisma` is already configured for this:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

`directUrl` is what makes migrations work through Supabase's connection pooler setup.

---

## 5. Push the schema to Supabase

From the project root:

```bash
npx prisma generate       # generates the Prisma Client
npx prisma db push        # creates all tables in your Supabase database
```

`db push` is the fastest way to sync the schema for development. Once the app is further along and you want versioned migrations instead, switch to:

```bash
npx prisma migrate dev --name init
```

You can verify the tables were created by opening **Supabase Dashboard → Table Editor**.

---

## 6. Seed demo data

```bash
npm run db:seed
```

This populates the database with demo students, listings, categories, reviews, etc. (see `prisma/seed.ts`).

---

## 7. (Optional) Product image uploads via Supabase Storage

If you want real image uploads instead of placeholder images:

1. In Supabase: **Storage → New Bucket** → name it `listing-images` → make it **Public**.
2. Making the bucket "Public" only allows public *reads* — you also need to explicitly allow uploads. Go to **Storage → Policies** (or run this in the SQL Editor) to allow anonymous uploads to this bucket:
   ```sql
   create policy "Public upload to listing-images"
   on storage.objects for insert
   to anon
   with check (bucket_id = 'listing-images');

   create policy "Public read of listing-images"
   on storage.objects for select
   to anon
   using (bucket_id = 'listing-images');
   ```
   (Without the insert policy, uploads will fail with a "row-level security policy" error even though the bucket is public.)
3. Get your project URL and anon key from **Project Settings → API**:
   ```
   NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxxxxxx.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon public key>"
   ```
4. Add those two to `.env` (local) **and** to your Vercel project's Environment Variables (production) — then redeploy.
5. The app's `storageService` (in `services/`) will use these automatically if present; otherwise it falls back to placeholder images so the UI never breaks.

---

## 8. Run the app

```bash
npm run dev
```

Visit http://localhost:3000 — the app should now be reading/writing through Prisma to your Supabase Postgres database.

---

## Troubleshooting

- **"Can't reach database server"** — check you copied the pooled `DATABASE_URL` (port `6543`) correctly, and that your Supabase project has finished provisioning.
- **Migrations hang or fail** — make sure `DIRECT_URL` (port `5432`) is set; migrations don't work through the transaction pooler alone.
- **SSL errors** — Supabase requires SSL; the connection strings from the dashboard already include the right settings, so avoid hand-editing them.
- **Free-tier project paused** — Supabase free projects pause after a period of inactivity; just open the dashboard once to wake it back up.
