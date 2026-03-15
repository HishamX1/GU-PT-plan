const api = '/api';
const errorEl = document.getElementById('error');
const successEl = document.getElementById('success');

const ids = {
  programCollege: document.getElementById('programCollege'),
  yearProgram: document.getElementById('yearProgram'),
  semesterYear: document.getElementById('semesterYear'),
  subjectSemester: document.getElementById('subjectSemester')
};

function setMessage(type, msg) {
  errorEl.textContent = type === 'error' ? msg : '';
  successEl.textContent = type === 'success' ? msg : '';
}

function renderOptions(el, items, label = 'name', value = 'id') {
  el.innerHTML = '<option value="">Select...</option>' + items
    .map((i) => `<option value="${i[value]}">${i[label] ?? i.yearNumber ?? i.semesterNumber}</option>`).join('');
}

async function request(path, options = {}) {
  const res = await fetch(`${api}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function loadRelations() {
  const colleges = await request('/colleges');
  renderOptions(ids.programCollege, colleges);

  const programs = await request('/programs');
  renderOptions(ids.yearProgram, programs);

  const years = await request('/years');
  renderOptions(ids.semesterYear, years, 'yearNumber');

  const semesters = await request('/semesters');
  renderOptions(ids.subjectSemester, semesters, 'semesterNumber');
}

document.getElementById('addCollege').onclick = async () => {
  try {
    const name = document.getElementById('collegeName').value.trim();
    if (!name) throw new Error('College name is required');
    await request('/colleges', { method: 'POST', body: JSON.stringify({ name }) });
    setMessage('success', 'College added');
    await loadRelations();
  } catch (e) { setMessage('error', e.message); }
};

document.getElementById('addProgram').onclick = async () => {
  try {
    const collegeId = Number(ids.programCollege.value);
    const name = document.getElementById('programName').value.trim();
    if (!collegeId || !name) throw new Error('Program fields are required');
    await request('/programs', { method: 'POST', body: JSON.stringify({ collegeId, name }) });
    setMessage('success', 'Program added');
    await loadRelations();
  } catch (e) { setMessage('error', e.message); }
};

document.getElementById('addYear').onclick = async () => {
  try {
    const programId = Number(ids.yearProgram.value);
    const yearNumber = Number(document.getElementById('yearNumber').value);
    if (!programId || !yearNumber) throw new Error('Year fields are required');
    await request('/years', { method: 'POST', body: JSON.stringify({ programId, yearNumber }) });
    setMessage('success', 'Year added');
    await loadRelations();
  } catch (e) { setMessage('error', e.message); }
};

document.getElementById('addSemester').onclick = async () => {
  try {
    const yearId = Number(ids.semesterYear.value);
    const semesterNumber = Number(document.getElementById('semesterNumber').value);
    if (!yearId || !semesterNumber) throw new Error('Semester fields are required');
    await request('/semesters', { method: 'POST', body: JSON.stringify({ yearId, semesterNumber }) });
    setMessage('success', 'Semester added');
    await loadRelations();
  } catch (e) { setMessage('error', e.message); }
};

document.getElementById('addSubject').onclick = async () => {
  try {
    const semesterId = Number(ids.subjectSemester.value);
    const subjectCode = document.getElementById('subjectCode').value.trim();
    const subjectName = document.getElementById('subjectName').value.trim();
    const credits = Number(document.getElementById('subjectCredits').value);
    const notes = document.getElementById('subjectNotes').value.trim() || null;
    if (!semesterId || !subjectCode || !subjectName || !credits) throw new Error('All subject fields are required');
    await request('/subjects', { method: 'POST', body: JSON.stringify({ semesterId, subjectCode, subjectName, credits, notes, prerequisiteSubjectIds: [] }) });
    setMessage('success', 'Subject added');
  } catch (e) { setMessage('error', e.message); }
};

loadRelations().catch((e) => setMessage('error', e.message));
