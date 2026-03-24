# Deployment Guide

## Environment files
- Copy `.env.example` to `.env` for local development.
- Set `PORT`, `API_BASE_PATH`, `CORS_ORIGIN`, `DATABASE_URL`, and `DATA_MODE` appropriately.

## Supabase (PostgreSQL)
1. Create a Supabase project.
2. Copy connection string into `DATABASE_URL`.
3. Ensure the Node runtime has the `pg` driver available (`npm install pg`).
4. Run migrations and seed from the backend service:
   - `npm run db:migrate`
   - `npm run db:seed`

## Render (Backend)
1. Create a new Web Service from this repository.
2. Root Directory: `modernization`.
3. Build command: `npm install`.
4. Start command: `npm run start`.
5. Configure env vars:
   - `PORT=4000`
   - `API_BASE_PATH=/api`
   - `CORS_ORIGIN=https://<your-vercel-domain>`
   - `DATABASE_URL=<your-supabase-or-postgres-url>`
   - `DATA_MODE=postgres`
6. Optional: reuse provided `render.yaml`.

## Vercel (Frontend)
1. Create a Vercel project with root `modernization/frontend`.
2. Add rewrite/proxy to backend using `modernization/vercel.json`.
3. Update `YOUR_RENDER_URL` placeholder.

## Post-deployment checks
- `GET /api/health` returns `{ status: "ok", mode: "postgres" }`.
- Student page loads cascading filters.
- Admin creates records and duplicate prevention returns 409.

## Restricted environment note
If package registries are blocked, backend still runs with no external npm dependencies and uses `data/runtime-db.json` for operational storage.
