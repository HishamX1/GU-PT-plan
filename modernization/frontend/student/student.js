const api = '/api';

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
  const res = await fetch(url);
  return res.json();
}

async function init() {
  const colleges = await fetchJson(`${api}/colleges`);
  options(collegeEl, colleges);
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
  const subjects = await fetchJson(`${api}/subjects?semesterId=${semesterEl.value}`);
  subjectsEl.innerHTML = subjects.map((s) =>
    `<tr><td>${s.subjectCode}</td><td>${s.subjectName}</td><td>${s.credits}</td><td>${s.notes ?? ''}</td></tr>`
  ).join('');
});

init();
