const api = window.location.origin.includes('localhost:4000')
  ? '/api'
  : 'http://localhost:4000/api';
const ADMIN_USER = 'Admin';
const ADMIN_PASS = 'Admin';

const errorEl = document.getElementById('error');
const successEl = document.getElementById('success');
const authErrorEl = document.getElementById('authError');
const loginCard = document.getElementById('adminLoginCard');
const dashboard = document.getElementById('adminDashboard');

const cache = { colleges: [], programs: [], years: [], semesters: [] };

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

function clearEntityInputs() {
  ['collegeName', 'programName', 'yearNumber', 'subjectCode', 'subjectName', 'subjectCredits', 'subjectNotes']
    .forEach((id) => {
      const input = document.getElementById(id);
      if (input) input.value = '';
    });
}

function existsInsensitive(items, predicate) {
  return items.some((item) => predicate(String(item || '').trim().toLowerCase()));
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
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Modernization API is unavailable. Run `cd modernization && npm run preview:local`.');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function loadRelations() {
  const colleges = await request('/colleges');
  cache.colleges = colleges;
  renderOptions(ids.programCollege, colleges);

  const programs = await request('/programs');
  cache.programs = programs;
  renderOptions(ids.yearProgram, programs);

  const years = await request('/years');
  cache.years = years;
  renderOptions(ids.semesterYear, years, 'yearNumber');

  const semesters = await request('/semesters');
  cache.semesters = semesters;
  renderOptions(ids.subjectSemester, semesters, 'semesterNumber');
}

async function validateUniqueSubject(semesterId, subjectCode) {
  const existing = await request(`/subjects?semesterId=${semesterId}`);
  return !existing.some((subject) => subject.subjectCode.toLowerCase() === subjectCode.toLowerCase());
}

function bindAdminActions() {
  document.getElementById('addCollege').onclick = async () => {
    try {
      const name = document.getElementById('collegeName').value.trim();
      if (!name) throw new Error('College name is required');
      if (existsInsensitive(cache.colleges.map((c) => c.name), (v) => v === name.toLowerCase())) {
        throw new Error('College already exists');
      }
      await request('/colleges', { method: 'POST', body: JSON.stringify({ name }) });
      setMessage('success', 'College added');
      clearEntityInputs();
      await loadRelations();
    } catch (e) { setMessage('error', e.message); }
  };

  document.getElementById('addProgram').onclick = async () => {
    try {
      const collegeId = Number(ids.programCollege.value);
      const name = document.getElementById('programName').value.trim();
      if (!collegeId || !name) throw new Error('Program fields are required');
      if (cache.programs.some((p) => p.collegeId === collegeId && p.name.toLowerCase() === name.toLowerCase())) {
        throw new Error('Program already exists for this college');
      }
      await request('/programs', { method: 'POST', body: JSON.stringify({ collegeId, name }) });
      setMessage('success', 'Program added');
      clearEntityInputs();
      await loadRelations();
    } catch (e) { setMessage('error', e.message); }
  };

  document.getElementById('addYear').onclick = async () => {
    try {
      const programId = Number(ids.yearProgram.value);
      const yearNumber = Number(document.getElementById('yearNumber').value);
      if (!programId || !yearNumber) throw new Error('Year fields are required');
      if (cache.years.some((y) => y.programId === programId && y.yearNumber === yearNumber)) {
        throw new Error('Year already exists for this program');
      }
      await request('/years', { method: 'POST', body: JSON.stringify({ programId, yearNumber }) });
      setMessage('success', 'Year added');
      clearEntityInputs();
      await loadRelations();
    } catch (e) { setMessage('error', e.message); }
  };

  document.getElementById('addSemester').onclick = async () => {
    try {
      const yearId = Number(ids.semesterYear.value);
      const semesterNumber = Number(document.getElementById('semesterNumber').value);
      if (!yearId || !semesterNumber) throw new Error('Semester fields are required');
      if (cache.semesters.some((s) => s.yearId === yearId && s.semesterNumber === semesterNumber)) {
        throw new Error('Semester already exists for this year');
      }
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

      const unique = await validateUniqueSubject(semesterId, subjectCode);
      if (!unique) throw new Error('Subject code already exists in this semester');

      const semester = cache.semesters.find((s) => s.id === semesterId);
      const year = cache.years.find((y) => y.id === semester?.yearId);
      const program = cache.programs.find((p) => p.id === year?.programId);
      const college = cache.colleges.find((c) => c.id === program?.collegeId);
      if (!semester || !year || !program || !college) throw new Error('Please reload relations and try again');

      await request('/subjects', {
        method: 'POST',
        body: JSON.stringify({
          semesterId,
          yearId: year.id,
          programId: program.id,
          collegeId: college.id,
          subjectCode,
          subjectName,
          credits,
          notes,
          prerequisiteSubjectIds: []
        })
      });
      setMessage('success', 'Subject added');
      clearEntityInputs();
    } catch (e) { setMessage('error', e.message); }
  };
}

function setupLogin() {
  const userInput = document.getElementById('adminUsername');
  const passInput = document.getElementById('adminPassword');
  const loginBtn = document.getElementById('adminLoginBtn');

  const onLogin = async () => {
    authErrorEl.textContent = '';
    const username = userInput.value.trim();
    const password = passInput.value.trim();

    if (username !== ADMIN_USER || password !== ADMIN_PASS) {
      authErrorEl.textContent = 'Invalid credentials. Use admin/admin.';
      return;
    }

    loginCard.hidden = true;
    dashboard.hidden = false;
    setMessage('success', 'Welcome admin');
    try {
      await loadRelations();
    } catch (error) {
      setMessage('error', error.message);
    }
  };

  loginBtn.addEventListener('click', onLogin);
  passInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') onLogin();
  });
}

bindAdminActions();
setupLogin();
