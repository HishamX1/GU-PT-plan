# GU Platform Modernization

This module is the dynamic university platform layer.

## Canonical runtime components

- Backend server: `backend/src/server.js`
- API routes: `backend/src/routes/catalogRoutes.js`
- Domain services: `backend/src/services/catalogService.js`
- Runtime store (file mode): `data/runtime-db.json`
- Student UI: `frontend/student/index.html`
- Admin UI: `frontend/admin/index.html`

## Canonical hierarchy

`Faculty -> Program -> Year -> Semester -> Course -> CoursePrerequisite`

(Compatibility note: API keeps legacy names `colleges` and `subjects`.)

## Run locally

```bash
npm install
DATA_MODE=file npm run extract:data
DATA_MODE=file npm run start
```

## Frontend API base configuration

Set one of:

- `?apiBase=https://your-api.example.com/api`
- `window.__GU_API_BASE__`
- `<meta name="gu-api-base" content="https://your-api.example.com/api">`

## API

- `GET /api/health`
- `GET /api/catalog`
- CRUD: `/api/colleges`, `/api/programs`, `/api/years`, `/api/semesters`, `/api/subjects`

`GET /api/subjects` returns `prerequisiteSubjectIds` so student/admin share the same canonical graph.

## Fallback

If the API is down, student UI switches to read-only mode and loads from `data/runtime-db.json`.
