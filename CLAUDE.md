# Campus Commerce

Monorepo: `backend/` is the Express + Prisma/PostgreSQL API (owns all data access); `frontend/` is the Next.js UI and must never import Prisma or query the database — it calls the API via `frontend/src/lib/api.ts` (server) or relative `/api/*` URLs (browser, rewritten to the backend). See README.md.

Frontend-specific instructions: @frontend/AGENTS.md
