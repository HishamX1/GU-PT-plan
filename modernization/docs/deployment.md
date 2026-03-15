# Deployment Guide

## Environment files
- Copy `.env.example` to `.env` for local development.
- Set `PORT`, `API_BASE_PATH`, and `CORS_ORIGIN` appropriately.

## Supabase (PostgreSQL)
1. Create a Supabase project.
2. Copy connection string into `DATABASE_URL`.
3. Run SQL migration/seed files in Supabase SQL editor:
   - `db/migrations/001_init.sql`
   - `db/seeds/001_seed.sql`

## Render (Backend)
1. Create a new Web Service from this repository.
2. Root Directory: `modernization`.
3. Build command: `npm install`.
4. Start command: `npm run start`.
5. Configure env vars:
   - `PORT=4000`
   - `API_BASE_PATH=/api`
   - `CORS_ORIGIN=https://<your-vercel-domain>`
6. Optional: reuse provided `render.yaml`.

## Vercel (Frontend)
1. Create a Vercel project with root `modernization/frontend`.
2. Add rewrite/proxy to backend using `modernization/vercel.json`.
3. Update `YOUR_RENDER_URL` placeholder.

## Post-deployment checks
- `GET /api/health` returns `{ status: "ok", mode: "offline-file-store" }`.
- Student page loads cascading filters.
- Admin creates records and duplicate prevention returns 409.

## Restricted environment note
If package registries are blocked, backend still runs with no external npm dependencies and uses `data/runtime-db.json` for operational storage.
