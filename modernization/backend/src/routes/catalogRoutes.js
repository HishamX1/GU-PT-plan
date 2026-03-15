import {
  createCollege,
  createProgram,
  createSemester,
  createSubject,
  createYear,
  getColleges,
  getPrograms,
  getSemesters,
  getSubjects,
  getYears
} from '../services/catalogService.js';
import {
  validateCollege,
  validateProgram,
  validateSemester,
  validateSubject,
  validateYear
} from '../validation/schemas.js';
import { env } from '../config/env.js';

function json(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': env.allowCorsOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
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

export async function handleApi(req, res, url) {
  if (!url.pathname.startsWith(env.apiBasePath)) return false;
  if (req.method === 'OPTIONS') return json(res, 204, {});

  try {
    if (req.method === 'GET' && url.pathname === `${env.apiBasePath}/health`) {
      return json(res, 200, { status: 'ok', mode: 'offline-file-store' });
    }

    if (req.method === 'GET' && url.pathname === `${env.apiBasePath}/colleges`) {
      return json(res, 200, getColleges());
    }

    if (req.method === 'POST' && url.pathname === `${env.apiBasePath}/colleges`) {
      const body = await parseBody(req);
      const err = validateCollege(body);
      if (err) return json(res, 400, { error: err });
      const created = createCollege(body);
      if (!created) return json(res, 409, { error: 'College already exists' });
      return json(res, 201, created);
    }

    if (req.method === 'GET' && url.pathname === `${env.apiBasePath}/programs`) {
      return json(res, 200, getPrograms(toNumber(url.searchParams.get('collegeId'))));
    }

    if (req.method === 'POST' && url.pathname === `${env.apiBasePath}/programs`) {
      const body = await parseBody(req);
      const err = validateProgram(body);
      if (err) return json(res, 400, { error: err });
      const created = createProgram(body);
      if (!created) return json(res, 409, { error: 'Program already exists for this college' });
      return json(res, 201, created);
    }

    if (req.method === 'GET' && url.pathname === `${env.apiBasePath}/years`) {
      return json(res, 200, getYears(toNumber(url.searchParams.get('programId'))));
    }

    if (req.method === 'POST' && url.pathname === `${env.apiBasePath}/years`) {
      const body = await parseBody(req);
      const err = validateYear(body);
      if (err) return json(res, 400, { error: err });
      const created = createYear(body);
      if (!created) return json(res, 409, { error: 'Year already exists for this program' });
      return json(res, 201, created);
    }

    if (req.method === 'GET' && url.pathname === `${env.apiBasePath}/semesters`) {
      return json(res, 200, getSemesters(toNumber(url.searchParams.get('yearId'))));
    }

    if (req.method === 'POST' && url.pathname === `${env.apiBasePath}/semesters`) {
      const body = await parseBody(req);
      const err = validateSemester(body);
      if (err) return json(res, 400, { error: err });
      const created = createSemester(body);
      if (!created) return json(res, 409, { error: 'Semester already exists for this year' });
      return json(res, 201, created);
    }

    if (req.method === 'GET' && url.pathname === `${env.apiBasePath}/subjects`) {
      return json(
        res,
        200,
        getSubjects({
          semesterId: toNumber(url.searchParams.get('semesterId')),
          yearId: toNumber(url.searchParams.get('yearId')),
          programId: toNumber(url.searchParams.get('programId'))
        })
      );
    }

    if (req.method === 'POST' && url.pathname === `${env.apiBasePath}/subjects`) {
      const body = await parseBody(req);
      const err = validateSubject(body);
      if (err) return json(res, 400, { error: err });
      const created = createSubject({ ...body, prerequisiteSubjectIds: body.prerequisiteSubjectIds || [] });
      if (!created) return json(res, 409, { error: 'Subject code already exists in this semester' });
      return json(res, 201, created);
    }

    return json(res, 404, { error: 'API route not found' });
  } catch (error) {
    if (error.message === 'INVALID_JSON') {
      return json(res, 400, { error: 'Invalid JSON payload' });
    }
    if (String(error.message || '').startsWith('FK_')) {
      return json(res, 400, { error: 'Invalid relation id provided.' });
    }
    return json(res, 500, { error: 'Internal server error' });
  }
}
