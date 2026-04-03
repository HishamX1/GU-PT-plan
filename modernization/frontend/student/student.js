const api = '/api';
const staticDataUrl = '../../data/runtime-db.json';
let staticDbPromise;

const collegeEl = document.getElementById('college');
const programEl = document.getElementById('program');
const yearEl = document.getElementById('year');
const semesterEl = document.getElementById('semester');
const subjectsEl = document.getElementById('subjects');

function options(select, items, labelKey = 'name', valueKey = 'id') {
  select.innerHTML = '<option value="">Select...</option>' + items
    .map((item) => `<option value="${item[valueKey]}">${item[labelKey] ?? item.yearNumber ?? item.semesterNumber}</option>`)
    .join('');
}

async function fetchJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    if (!url.startsWith(api)) throw error;
    const db = await getStaticDb();
    return resolveFromStaticDb(url, db);
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

function resolveFromStaticDb(url, db) {
  const parsed = new URL(url, 'https://local.test');
  const path = parsed.pathname;
  const q = parsed.searchParams;

  if (path === '/api/colleges') return db.colleges ?? [];
  if (path === '/api/programs') {
    const collegeId = Number(q.get('collegeId'));
    return (db.programs ?? []).filter((p) => !collegeId || p.collegeId === collegeId);
  }
  if (path === '/api/years') {
    const programId = Number(q.get('programId'));
    return (db.years ?? []).filter((y) => !programId || y.programId === programId);
  }
  if (path === '/api/semesters') {
    const yearId = Number(q.get('yearId'));
    return (db.semesters ?? []).filter((s) => !yearId || s.yearId === yearId);
  }
  if (path === '/api/subjects') {
    const collegeId = Number(q.get('collegeId'));
    const programId = Number(q.get('programId'));
    const yearId = Number(q.get('yearId'));
    const semesterId = Number(q.get('semesterId'));

    const semesterMap = new Map((db.semesters ?? []).map((s) => [s.id, s]));
    const yearMap = new Map((db.years ?? []).map((y) => [y.id, y]));
    const programMap = new Map((db.programs ?? []).map((p) => [p.id, p]));

    return (db.subjects ?? []).filter((s) => {
      const sem = semesterMap.get(s.semesterId);
      const year = yearMap.get(sem?.yearId);
      const program = programMap.get(year?.programId);
      return (
        (!collegeId || program?.collegeId === collegeId) &&
        (!programId || year?.programId === programId) &&
        (!yearId || sem?.yearId === yearId) &&
        (!semesterId || s.semesterId === semesterId)
      );
    });
  }
  return [];
}

async function init() {
  const faculties = await fetchJson(`${api}/colleges`);
  options(collegeEl, faculties);
}

collegeEl.addEventListener('change', async () => {
  programEl.disabled = !collegeEl.value;
  yearEl.disabled = true;
  semesterEl.disabled = true;
  options(programEl, []); options(yearEl, []); options(semesterEl, []);
  subjectsEl.innerHTML = '';
  if (!collegeEl.value) return;
  const programs = await fetchJson(`${api}/programs?collegeId=${collegeEl.value}`);
  options(programEl, programs);
});

programEl.addEventListener('change', async () => {
  yearEl.disabled = !programEl.value;
  semesterEl.disabled = true;
  options(yearEl, []); options(semesterEl, []);
  subjectsEl.innerHTML = '';
  if (!programEl.value) return;
  const years = await fetchJson(`${api}/years?programId=${programEl.value}`);
  options(yearEl, years, 'yearNumber');
});

yearEl.addEventListener('change', async () => {
  semesterEl.disabled = !yearEl.value;
  options(semesterEl, []);
  subjectsEl.innerHTML = '';
  if (!yearEl.value) return;
  const semesters = await fetchJson(`${api}/semesters?yearId=${yearEl.value}`);
  options(semesterEl, semesters, 'semesterNumber');
});

semesterEl.addEventListener('change', async () => {
  subjectsEl.innerHTML = '';
  if (!semesterEl.value) return;
  const subjects = await fetchJson(`${api}/subjects?collegeId=${collegeEl.value}&programId=${programEl.value}&yearId=${yearEl.value}&semesterId=${semesterEl.value}`);
  subjectsEl.innerHTML = subjects.map((s) =>
    `<tr><td>${s.subjectCode}</td><td>${s.subjectName}</td><td>${s.credits}</td><td>${s.notes ?? ''}</td></tr>`
  ).join('');
});

init();
