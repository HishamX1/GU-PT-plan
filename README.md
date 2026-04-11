# Galala University Study Plan Platform (Dynamic Architecture)

This repository now uses a **live backend API as the canonical source of truth** for mutable university data.

## Canonical entry points

- **Student portal UI (static, GitHub Pages compatible):** `modernization/frontend/student/index.html`
- **Admin portal UI (static, GitHub Pages compatible):** `modernization/frontend/admin/index.html`
- **Backend API + static UI host for local/full-stack deployment:** `modernization/backend/src/server.js`
- **API routes:** `modernization/backend/src/routes/catalogRoutes.js`
- **Catalog domain logic:** `modernization/backend/src/services/catalogService.js`
- **Canonical runtime store (file mode fallback):** `modernization/data/runtime-db.json`

## Unified data model (university-wide)

Canonical hierarchy used across admin + student:

`Faculty -> Program -> Year -> Semester -> Course -> CoursePrerequisite`

Internal API/db naming keeps compatibility with existing endpoints (`colleges`, `subjects`) but UI labels and docs use:

- `college` = faculty
- `subject` = course

## Data flow (single source of truth)

`Admin UI -> Live API -> Canonical store (Postgres preferred, file fallback) -> Derived export artifacts -> Student UI`

- The admin portal only performs writes through the live API.
- The student portal reads from the same API.
- Static files are now fallback/bootstrap artifacts only.

## Quick start (free local setup)

```bash
cd modernization
npm install
DATA_MODE=file npm run extract:data
DATA_MODE=file npm run start
```

Open:
- `http://localhost:4000/` (student)
- `http://localhost:4000/admin` (admin)

## Environment variables

Backend (`modernization/backend/src/config/env.js`):

- `PORT` (default: `4000`)
- `API_BASE_PATH` (default: `/api`)
- `CORS_ORIGIN` (default: `*`)
- `DATA_MODE` (`postgres` or `file`)
- `DATABASE_URL` (required for postgres mode)
- `PG_SSL` (`true|false`)

Frontend API configuration (student/admin):

- Query param: `?apiBase=https://your-backend.example.com/api`
- OR runtime global: `window.__GU_API_BASE__`
- OR `<meta name="gu-api-base" content="https://your-backend.example.com/api">`

## Deployment (free-friendly)

Recommended:

- **Frontend**: GitHub Pages (student/admin static files)
- **Backend API**: Render / Railway free tier / any free Node host
- **Database**: Supabase Postgres free tier (preferred) or file fallback

> GitHub Pages remains static-only; it cannot host the Node API itself.

## Fallback behavior

When the live API is unavailable:

- Student portal enters **read-only fallback mode** and reads from `modernization/data/runtime-db.json`.
- Admin portal shows an API-unavailable error (no writes are attempted offline).

## Migration status

The existing Physical Therapy hierarchy is migrated into the dynamic model and loaded into:

- `modernization/data/academic-plan.json` (source extraction artifact)
- `modernization/data/runtime-db.json` (runtime fallback store)

## Validation and integrity rules

Backend enforces:

- Required fields and type checks
- Hierarchy relation validation (faculty/program/year/semester consistency)
- Duplicate prevention
- Prerequisite validation (valid ids only, no self-reference)
- Cascade-safe deletes

## Smoke checks

From `modernization`:

```bash
npm run check
npm run smoke
```

`smoke` verifies health + CRUD flows.
