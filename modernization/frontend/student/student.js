const configuredApiBase =
  window.__GU_API_BASE__ ||
  new URLSearchParams(window.location.search).get('apiBase') ||
  localStorage.getItem('guApiBase') ||
  document.querySelector('meta[name="gu-api-base"]')?.content ||
  '';

const apiCandidates = (() => {
  if (configuredApiBase) return [configuredApiBase.replace(/\/$/, '')];
  if (window.location.origin.includes('localhost:4000')) return ['/api'];
  const localApi = window.location.protocol === 'https:' ? null : 'http://localhost:4000/api';
  return [`${window.location.origin}/api`, localApi].filter(Boolean);
})();

let api = apiCandidates[0];
const staticDataUrl = '../../data/runtime-db.json';
let staticDbPromise;

const readonlyNoticeEl = document.getElementById('readonlyNotice');
const collegeEl = document.getElementById('college');
const programEl = document.getElementById('program');
const yearEl = document.getElementById('year');
const semesterEl = document.getElementById('semester');
const subjectsEl = document.getElementById('subjects');

function setReadonlyMode(enabled) {
  readonlyNoticeEl.hidden = !enabled;
}

function options(select, items, labelKey = 'name', valueKey = 'id') {
  select.innerHTML = '<option value="">Select...</option>' + items
    .map((item) => `<option value="${item[valueKey]}">${item[labelKey] ?? item.yearNumber ?? item.semesterNumber}</option>`)
    .join('');
}

async function fetchApiJson(path) {
  let lastError = null;

  for (const candidate of [api, ...apiCandidates.filter((x) => x !== api)]) {
    try {
      const url = `${candidate}${path}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      api = candidate;
      setReadonlyMode(false);
      return await res.json();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Live API unavailable');
}

async function fetchJson(path) {
  try {
    return await fetchApiJson(path);
  } catch {
    setReadonlyMode(true);
    const db = await getStaticDb();
    return resolveFromStaticDb(path, db);
  }
}

async function getStaticDb() {
  if (!staticDbPromise) {
    staticDbPromise = fetch(staticDataUrl).then((res) => {
      if (!res.ok) throw new Error('Failed to load static data');
      return res.json();
    });
  }
  return staticDbPromise;
}

function resolveFromStaticDb(pathAndQuery, db) {
  const parsed = new URL(pathAndQuery, 'https://local.test');
  const path = parsed.pathname;
  const q = parsed.searchParams;

  if (path === '/colleges') return db.colleges ?? [];
  if (path === '/programs') {
    const collegeId = Number(q.get('collegeId'));
    return (db.programs ?? []).filter((p) => !collegeId || p.collegeId === collegeId);
  }
  if (path === '/years') {
    const programId = Number(q.get('programId'));
    return (db.years ?? []).filter((y) => !programId || y.programId === programId);
  }
  if (path === '/semesters') {
    const yearId = Number(q.get('yearId'));
    return (db.semesters ?? []).filter((s) => !yearId || s.yearId === yearId);
  }
  if (path === '/subjects') {
    const semesterId = Number(q.get('semesterId'));
    const yearId = Number(q.get('yearId'));
    const programId = Number(q.get('programId'));
    const collegeId = Number(q.get('collegeId'));

    const semesterMap = new Map((db.semesters ?? []).map((s) => [s.id, s]));
    const yearMap = new Map((db.years ?? []).map((y) => [y.id, y]));
    const programMap = new Map((db.programs ?? []).map((p) => [p.id, p]));

    return (db.subjects ?? []).filter((s) => {
      const sem = semesterMap.get(s.semesterId);
      const year = yearMap.get(sem?.yearId);
      const program = programMap.get(year?.programId);
      return (
        (!semesterId || s.semesterId === semesterId) &&
        (!yearId || sem?.yearId === yearId) &&
        (!programId || year?.programId === programId) &&
        (!collegeId || program?.collegeId === collegeId)
      );
    });
  }

  return [];
}

async function init() {
  const faculties = await fetchJson('/colleges');
  options(collegeEl, faculties);
}

collegeEl.addEventListener('change', async () => {
  programEl.disabled = !collegeEl.value;
  yearEl.disabled = true;
  semesterEl.disabled = true;
  options(programEl, []); options(yearEl, []); options(semesterEl, []);
  subjectsEl.innerHTML = '';
  if (!collegeEl.value) return;
  const programs = await fetchJson(`/programs?collegeId=${collegeEl.value}`);
  options(programEl, programs);
});

programEl.addEventListener('change', async () => {
  yearEl.disabled = !programEl.value;
  semesterEl.disabled = true;
  options(yearEl, []); options(semesterEl, []);
  subjectsEl.innerHTML = '';
  if (!programEl.value) return;
  const years = await fetchJson(`/years?programId=${programEl.value}`);
  options(yearEl, years, 'yearNumber');
});

yearEl.addEventListener('change', async () => {
  semesterEl.disabled = !yearEl.value;
  options(semesterEl, []);
  subjectsEl.innerHTML = '';
  if (!yearEl.value) return;
  const semesters = await fetchJson(`/semesters?yearId=${yearEl.value}`);
  options(semesterEl, semesters, 'semesterNumber');
});

semesterEl.addEventListener('change', async () => {
  subjectsEl.innerHTML = '';
  if (!semesterEl.value) return;
  const subjects = await fetchJson(`/subjects?collegeId=${collegeEl.value}&programId=${programEl.value}&yearId=${yearEl.value}&semesterId=${semesterEl.value}`);
  subjectsEl.innerHTML = subjects.map((s) =>
    `<tr><td>${s.subjectCode}</td><td>${s.subjectName}</td><td>${s.credits}</td><td>${s.notes ?? ''}</td></tr>`
  ).join('');
});

init();
