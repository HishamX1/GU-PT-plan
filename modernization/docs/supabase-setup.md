# Supabase Setup Guide (Backend + Database)

This project already supports PostgreSQL. Supabase can be used as the managed Postgres database so your admin and student portals share a live, persistent data source.

## 1) Create your Supabase project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Wait until the database is provisioned.
3. In **Project Settings -> Database**, copy the **Connection string**.
   - Prefer the **Transaction pooler** connection on port `6543`.
   - Make sure it includes `sslmode=require`.

## 2) Configure this repository

From the `modernization` folder:

```bash
cp .env.example .env
```

Edit `.env`:

```dotenv
DATA_MODE=postgres
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
PG_SSL=true
PORT=4000
API_BASE_PATH=/api
CORS_ORIGIN=http://localhost:4000
```

> If your host blocks loading `.env` files automatically, export these variables in the host dashboard instead.

## 3) Install and run database migrations

```bash
npm install
npm run db:migrate
npm run db:seed
```

- `db:migrate` creates the normalized catalog schema.
- `db:seed` loads initial catalog data.

## 4) Run the API and verify PostgreSQL mode

```bash
npm run start
```

Then verify:

```bash
curl http://localhost:4000/api/health
```

Expected response:

```json
{ "status": "ok", "mode": "postgres" }
```

If `mode` is `offline-file-store`, your environment variables are not being picked up.

## 5) Connect the frontends to your deployed API

You can set the API base URL in any of these ways:

- Query parameter: `?apiBase=https://your-backend.example.com/api`
- Runtime global: `window.__GU_API_BASE__ = "https://your-backend.example.com/api"`
- Meta tag: `<meta name="gu-api-base" content="https://your-backend.example.com/api">`
- Admin login screen: **Live API Base URL** (stored in browser localStorage)

## 6) Production checklist

- Backend env vars:
  - `DATA_MODE=postgres`
  - `DATABASE_URL=<supabase-connection-string>`
  - `PG_SSL=true`
  - `CORS_ORIGIN=<your-frontend-domain>`
- Run `npm run db:migrate` once per environment before traffic.
- Optionally run `npm run db:seed` for first-time data bootstrapping.

## 7) Optional: using Supabase Auth/JS directly

This repo currently uses the backend REST API as the source of truth. You do **not** need `@supabase/supabase-js` for core CRUD unless you want to add Supabase Auth, Storage, or Realtime features in the frontend.

A good path is:

1. Keep catalog CRUD through existing backend endpoints.
2. Add Supabase Auth tokens to backend request validation.
3. Keep Row Level Security in Supabase as a second safety layer for direct SQL clients.

## Troubleshooting

- **Error: `Database is not configured`**
  - Ensure `DATABASE_URL` is present and `DATA_MODE=postgres`.
- **SSL / connection refused**
  - Confirm `sslmode=require` in URL and `PG_SSL=true`.
- **`mode` still not postgres**
  - Confirm you launched from `modernization` where `.env` is loaded by your host/process manager.
- **Migration fails**
  - Verify DB user has privileges to create tables and indexes.
