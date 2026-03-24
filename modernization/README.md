# GU PT Plan Modernization Module

This module extends the original proof-of-concept without altering existing root project files.

## What is included
- Structured academic model extracted from `../data.js` into `data/academic-plan.json`.
- Normalized PostgreSQL schema and migration scripts for production databases.
- Seed pipeline that imports all years/semesters/subjects and prerequisite links.
- Node.js backend APIs with validation, duplicate prevention, and PostgreSQL runtime support.
- Minimal student interface and admin dashboard (dropdown-driven relation input).
- Deployment instructions/artifacts for Vercel (frontend), Render (backend), and Supabase (database).

## Folder structure
- `data/`: extracted academic plan JSON + runtime store.
- `db/migrations/`: SQL schema migrations.
- `db/seeds/`: generated SQL seed artifact.
- `backend/`: Node.js API runtime.
- `frontend/student`: student view.
- `frontend/admin`: admin dashboard.
- `scripts/`: extraction + smoke testing scripts.
- `docs/`: repository analysis and deployment guide.

## Quick start
1. `cd modernization`
2. `npm install`
3. `cp .env.example .env`
4. `npm run extract:data`
5. `npm run db:migrate`
6. `npm run db:seed`
7. `npm run start`

## Launch readiness checks
1. Start backend: `npm run start`
2. In a second terminal: `npm run smoke`
3. Visit:
   - `http://localhost:4000/` (student)
   - `http://localhost:4000/admin` (admin)

## Local preview (no changes to original PT plan files)
Use this when you want a full preview without editing root `data.js` or any original plan assets.

1. `cd modernization`
2. `npm install`
3. `npm run preview:local`
4. Open:
   - `http://localhost:4000/` (student preview)
   - `http://localhost:4000/admin` (admin preview)

Notes:
- `preview:local` reads/extracts from the root `../data.js` and writes only to modernization runtime artifacts (`data/academic-plan.json` and `data/runtime-db.json`).
- It does not modify the original study plan source files.


## Current operational scope
- Admin can create **colleges (faculties)**, programs, years, semesters, and subjects via `/admin`.
- Student portal browses records through cascading filters and loads subjects with the full hierarchy (`collegeId`, `programId`, `yearId`, `semesterId`) to prevent cross-faculty/cross-program mismatches.
- Runtime supports `postgres` mode for live deployments and `file` mode only as a fallback.

## Production database readiness
- PostgreSQL migrations and seed SQL are included under `db/migrations` and `db/seeds`.
- Backend services now execute SQL in `postgres` mode (with DB constraints + duplicate protection) and preserve file mode only for restricted environments.
- For live deployments, set `DATA_MODE=postgres`, configure `DATABASE_URL`, and ensure the `pg` driver is available in your runtime environment.

## REST API
- `GET /api/colleges` | `POST /api/colleges`
- `GET /api/programs?collegeId=...` | `POST /api/programs`
- `GET /api/years?programId=...` | `POST /api/years`
- `GET /api/semesters?yearId=...` | `POST /api/semesters`
- `GET /api/subjects?collegeId=...&programId=...&yearId=...&semesterId=...` | `POST /api/subjects`

## Data integrity and human error prevention
- Required fields validated in backend schemas.
- Foreign-key-like relation checks in services.
- Duplicate prevention on all entity insertions.
- Admin UI enforces dropdown relation picking.
- POST endpoints return `409` on duplicates.

## Restricted environment mode
If package registries are blocked, runtime still works with no external dependencies and stores data at `data/runtime-db.json`.

## Hosting note
- GitHub Pages is static-only; full modernization behavior requires running backend API locally or on a deployed server.


## Merge note (v2)
If merge conflicts occur, keep this file's sections for `Local preview`, `Production database readiness`, and `REST API` as the source of truth. Also keep `modernization/package.json` script names unchanged (`extract:data`, `db:migrate`, `db:seed`, `smoke`, `preview:local`).
