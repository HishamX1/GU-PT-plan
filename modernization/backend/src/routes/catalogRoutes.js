import {
  createCollege,
  createProgram,
  createSemester,
  createSubject,
  createYear,
  deleteCollege,
  deleteProgram,
  deleteSemester,
  deleteSubject,
  deleteYear,
  getColleges,
  getPrograms,
  getSemesters,
  getSubjects,
  getYears,
  updateCollege,
  updateProgram,
  updateSemester,
  updateSubject,
  updateYear
} from '../services/catalogService.js';
import {
  validateCollege,
  validateCollegePatch,
  validateEntityId,
  validateProgram,
  validateProgramPatch,
  validateSemester,
  validateSemesterPatch,
  validateSubject,
  validateSubjectPatch,
  validateYear,
  validateYearPatch
} from '../validation/schemas.js';
import { env } from '../config/env.js';

function json(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': env.allowCorsOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  });
  res.end(JSON.stringify(data));
}

async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8') || '{}';
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('INVALID_JSON');
  }
}

function toNumber(v) {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

async function handleUpdate(req, res, validator, updater, id, label) {
  const idErr = validateEntityId(id, `${label} id`);
  if (idErr) return json(res, 400, { error: idErr });
  const body = await parseBody(req);
  const err = validator(body);
  if (err) return json(res, 400, { error: err });
  const updated = await updater(id, body);
  if (updated === false) return json(res, 404, { error: `${label} not found` });
  if (!updated) return json(res, 409, { error: `${label} already exists` });
  return json(res, 200, updated);
}

async function handleDelete(res, deleter, id, label) {
  const idErr = validateEntityId(id, `${label} id`);
  if (idErr) return json(res, 400, { error: idErr });
  const deleted = await deleter(id);
  if (!deleted) return json(res, 404, { error: `${label} not found` });
  return json(res, 200, { deleted: true, id });
}

export async function handleApi(req, res, url) {
  if (!url.pathname.startsWith(env.apiBasePath)) return false;
  if (req.method === 'OPTIONS') return json(res, 204, {});

  try {
    if (req.method === 'GET' && url.pathname === `${env.apiBasePath}/health`) {
      return json(res, 200, { status: 'ok', mode: env.dataMode === 'postgres' ? 'postgres' : 'offline-file-store' });
    }

    if (req.method === 'GET' && url.pathname === `${env.apiBasePath}/colleges`) {
      return json(res, 200, await getColleges());
    }

    if (req.method === 'POST' && url.pathname === `${env.apiBasePath}/colleges`) {
      const body = await parseBody(req);
      const err = validateCollege(body);
      if (err) return json(res, 400, { error: err });
      const created = await createCollege(body);
      if (!created) return json(res, 409, { error: 'College already exists' });
      return json(res, 201, created);
    }

    if (req.method === 'PUT' && url.pathname.startsWith(`${env.apiBasePath}/colleges/`)) {
      const id = toNumber(url.pathname.split('/').pop());
      return handleUpdate(req, res, validateCollegePatch, updateCollege, id, 'College');
    }

    if (req.method === 'DELETE' && url.pathname.startsWith(`${env.apiBasePath}/colleges/`)) {
      const id = toNumber(url.pathname.split('/').pop());
      return handleDelete(res, deleteCollege, id, 'College');
    }

    if (req.method === 'GET' && url.pathname === `${env.apiBasePath}/programs`) {
      return json(res, 200, await getPrograms(toNumber(url.searchParams.get('collegeId'))));
    }

    if (req.method === 'POST' && url.pathname === `${env.apiBasePath}/programs`) {
      const body = await parseBody(req);
      const err = validateProgram(body);
      if (err) return json(res, 400, { error: err });
      const created = await createProgram(body);
      if (!created) return json(res, 409, { error: 'Program already exists for this college' });
      return json(res, 201, created);
    }

    if (req.method === 'PUT' && url.pathname.startsWith(`${env.apiBasePath}/programs/`)) {
      const id = toNumber(url.pathname.split('/').pop());
      return handleUpdate(req, res, validateProgramPatch, updateProgram, id, 'Program');
    }

    if (req.method === 'DELETE' && url.pathname.startsWith(`${env.apiBasePath}/programs/`)) {
      const id = toNumber(url.pathname.split('/').pop());
      return handleDelete(res, deleteProgram, id, 'Program');
    }

    if (req.method === 'GET' && url.pathname === `${env.apiBasePath}/years`) {
      return json(res, 200, await getYears(toNumber(url.searchParams.get('programId'))));
    }

    if (req.method === 'POST' && url.pathname === `${env.apiBasePath}/years`) {
      const body = await parseBody(req);
      const err = validateYear(body);
      if (err) return json(res, 400, { error: err });
      const created = await createYear(body);
      if (!created) return json(res, 409, { error: 'Year already exists for this program' });
      return json(res, 201, created);
    }

    if (req.method === 'PUT' && url.pathname.startsWith(`${env.apiBasePath}/years/`)) {
      const id = toNumber(url.pathname.split('/').pop());
      return handleUpdate(req, res, validateYearPatch, updateYear, id, 'Year');
    }

    if (req.method === 'DELETE' && url.pathname.startsWith(`${env.apiBasePath}/years/`)) {
      const id = toNumber(url.pathname.split('/').pop());
      return handleDelete(res, deleteYear, id, 'Year');
    }

    if (req.method === 'GET' && url.pathname === `${env.apiBasePath}/semesters`) {
      return json(res, 200, await getSemesters(toNumber(url.searchParams.get('yearId'))));
    }

    if (req.method === 'POST' && url.pathname === `${env.apiBasePath}/semesters`) {
      const body = await parseBody(req);
      const err = validateSemester(body);
      if (err) return json(res, 400, { error: err });
      const created = await createSemester(body);
      if (!created) return json(res, 409, { error: 'Semester already exists for this year' });
      return json(res, 201, created);
    }

    if (req.method === 'PUT' && url.pathname.startsWith(`${env.apiBasePath}/semesters/`)) {
      const id = toNumber(url.pathname.split('/').pop());
      return handleUpdate(req, res, validateSemesterPatch, updateSemester, id, 'Semester');
    }

    if (req.method === 'DELETE' && url.pathname.startsWith(`${env.apiBasePath}/semesters/`)) {
      const id = toNumber(url.pathname.split('/').pop());
      return handleDelete(res, deleteSemester, id, 'Semester');
    }

    if (req.method === 'GET' && url.pathname === `${env.apiBasePath}/subjects`) {
      return json(
        res,
        200,
        await getSubjects({
          semesterId: toNumber(url.searchParams.get('semesterId')),
          yearId: toNumber(url.searchParams.get('yearId')),
          programId: toNumber(url.searchParams.get('programId')),
          collegeId: toNumber(url.searchParams.get('collegeId'))
        })
      );
    }

    if (req.method === 'POST' && url.pathname === `${env.apiBasePath}/subjects`) {
      const body = await parseBody(req);
      const err = validateSubject(body);
      if (err) return json(res, 400, { error: err });
      const created = await createSubject({ ...body, prerequisiteSubjectIds: body.prerequisiteSubjectIds || [] });
      if (!created) return json(res, 409, { error: 'Subject code already exists in this semester' });
      return json(res, 201, created);
    }

    if (req.method === 'PUT' && url.pathname.startsWith(`${env.apiBasePath}/subjects/`)) {
      const id = toNumber(url.pathname.split('/').pop());
      return handleUpdate(req, res, validateSubjectPatch, updateSubject, id, 'Subject');
    }

    if (req.method === 'DELETE' && url.pathname.startsWith(`${env.apiBasePath}/subjects/`)) {
      const id = toNumber(url.pathname.split('/').pop());
      return handleDelete(res, deleteSubject, id, 'Subject');
    }

    return json(res, 404, { error: 'API route not found' });
  } catch (error) {
    if (error.message === 'INVALID_JSON') {
      return json(res, 400, { error: 'Invalid JSON payload' });
    }
    if (String(error.message || '').startsWith('FK_')) {
      if (error.message === 'FK_HIERARCHY') return json(res, 400, { error: 'Invalid hierarchy selection.' });
      return json(res, 400, { error: 'Invalid relation id provided.' });
    }
    if (error.message === 'PG_DRIVER_MISSING') {
      return json(res, 500, { error: 'PostgreSQL driver is missing. Install pg or switch DATA_MODE=file.' });
    }
    if (error.message === 'DB_NOT_CONFIGURED') {
      return json(res, 500, { error: 'Database is not configured. Check DATA_MODE and DATABASE_URL.' });
    }
    return json(res, 500, { error: 'Internal server error' });
  }
}
