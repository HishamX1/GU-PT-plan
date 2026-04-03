const apiCandidates = (() => {
  const localApi = 'http://localhost:4000/api';
  const sameOriginApi = `${window.location.origin}/api`;
  if (window.location.origin.includes('localhost:4000')) return ['/api'];
  return [sameOriginApi, localApi];
})();
let workingApiBase = apiCandidates[0];
const ADMIN_USER = 'Admin';
const ADMIN_PASS = 'Admin';

const errorEl = document.getElementById('error');
const successEl = document.getElementById('success');
const authErrorEl = document.getElementById('authError');
const loginCard = document.getElementById('adminLoginCard');
const dashboard = document.getElementById('adminDashboard');

const cache = { colleges: [], programs: [], years: [], semesters: [], subjects: [] };

const ids = {
  programCollege: document.getElementById('programCollege'),
  yearProgram: document.getElementById('yearProgram'),
  semesterYear: document.getElementById('semesterYear'),
  subjectSemester: document.getElementById('subjectSemester')
};

const lists = {
  colleges: document.getElementById('collegeList'),
  programs: document.getElementById('programList'),
  years: document.getElementById('yearList'),
  semesters: document.getElementById('semesterList'),
  subjects: document.getElementById('subjectList')
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

function renderOptions(el, items, label = 'name', value = 'id') {
  el.innerHTML = '<option value="">Select...</option>' + items
    .map((i) => `<option value="${i[value]}">${i[label] ?? i.yearNumber ?? i.semesterNumber}</option>`).join('');
}

async function request(path, options = {}) {
  let lastError = null;

  for (const base of [workingApiBase, ...apiCandidates.filter((c) => c !== workingApiBase)]) {
    try {
      const res = await fetch(`${base}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Modernization API is unavailable (localhost:4000 host unavailable). Run `cd modernization && npm run preview:local` and open http://localhost:4000/admin.');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      workingApiBase = base;
      return data;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Failed to fetch API (localhost:4000 host unavailable).');
}

function lookupName(collection, id, key = 'name') {
  return collection.find((item) => item.id === id)?.[key] ?? '-';
}

function entityRow(label, id, onRename, onDelete) {
  return `<div class="entity-row"><span>${label}</span><div class="actions"><button data-edit="${id}" data-kind="${onRename}">Rename</button><button class="danger" data-delete="${id}" data-kind="${onDelete}">Delete</button></div></div>`;
}

function renderLists() {
  lists.colleges.innerHTML = cache.colleges.map((c) => entityRow(c.name, c.id, 'college', 'college')).join('') || '<p>No faculties yet.</p>';

  lists.programs.innerHTML = cache.programs.map((p) => entityRow(`${p.name} (${lookupName(cache.colleges, p.collegeId)})`, p.id, 'program', 'program')).join('') || '<p>No programs yet.</p>';

  lists.years.innerHTML = cache.years.map((y) => entityRow(`Year ${y.yearNumber} (${lookupName(cache.programs, y.programId)})`, y.id, 'year', 'year')).join('') || '<p>No years yet.</p>';

  lists.semesters.innerHTML = cache.semesters.map((s) => entityRow(`Semester ${s.semesterNumber} (Year ${lookupName(cache.years, s.yearId, 'yearNumber')})`, s.id, 'semester', 'semester')).join('') || '<p>No semesters yet.</p>';

  lists.subjects.innerHTML = cache.subjects.map((s) => {
    const semester = lookupName(cache.semesters, s.semesterId, 'semesterNumber');
    return `<tr><td>${s.subjectCode}</td><td>${s.subjectName}</td><td>${s.credits}</td><td>${semester}</td><td><button data-edit="${s.id}" data-kind="subject">Edit</button> <button class="danger" data-delete="${s.id}" data-kind="subject">Delete</button></td></tr>`;
  }).join('') || '<tr><td colspan="5">No subjects yet.</td></tr>';
}

async function loadRelations() {
  cache.colleges = await request('/colleges');
  cache.programs = await request('/programs');
  cache.years = await request('/years');
  cache.semesters = await request('/semesters');
  cache.subjects = await request('/subjects');

  renderOptions(ids.programCollege, cache.colleges);
  renderOptions(ids.yearProgram, cache.programs);
  renderOptions(ids.semesterYear, cache.years, 'yearNumber');
  renderOptions(ids.subjectSemester, cache.semesters, 'semesterNumber');
  renderLists();
}

function bindCrudDelegates() {
  document.body.addEventListener('click', async (event) => {
    const editBtn = event.target.closest('[data-edit]');
    const deleteBtn = event.target.closest('[data-delete]');

    try {
      if (editBtn) {
        const id = Number(editBtn.dataset.edit);
        const kind = editBtn.dataset.kind;

        if (kind === 'college') {
          const current = cache.colleges.find((x) => x.id === id);
          const name = prompt('New faculty name:', current?.name || '');
          if (!name) return;
          await request(`/colleges/${id}`, { method: 'PUT', body: JSON.stringify({ name }) });
        } else if (kind === 'program') {
          const current = cache.programs.find((x) => x.id === id);
          const name = prompt('New program name:', current?.name || '');
          if (!name) return;
          await request(`/programs/${id}`, { method: 'PUT', body: JSON.stringify({ name }) });
        } else if (kind === 'year') {
          const current = cache.years.find((x) => x.id === id);
          const yearNumber = Number(prompt('New year number:', String(current?.yearNumber || '')));
          if (!yearNumber) return;
          await request(`/years/${id}`, { method: 'PUT', body: JSON.stringify({ yearNumber }) });
        } else if (kind === 'semester') {
          const current = cache.semesters.find((x) => x.id === id);
          const semesterNumber = Number(prompt('New semester number (1 or 2):', String(current?.semesterNumber || '')));
          if (![1, 2].includes(semesterNumber)) return;
          await request(`/semesters/${id}`, { method: 'PUT', body: JSON.stringify({ semesterNumber }) });
        } else if (kind === 'subject') {
          const current = cache.subjects.find((x) => x.id === id);
          const subjectName = prompt('Subject name:', current?.subjectName || '');
          if (!subjectName) return;
          await request(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify({ subjectName }) });
        }

        setMessage('success', `${kind} updated.`);
        await loadRelations();
      }

      if (deleteBtn) {
        const id = Number(deleteBtn.dataset.delete);
        const kind = deleteBtn.dataset.kind;
        if (!confirm(`Delete this ${kind}? This action may cascade to child records.`)) return;

        await request(`/${kind === 'college' ? 'colleges' : `${kind}s`}/${id}`, { method: 'DELETE' });
        setMessage('success', `${kind} deleted.`);
        await loadRelations();
      }
    } catch (e) {
      setMessage('error', e.message);
    }
  });
}

function bindAdminActions() {
  document.getElementById('addCollege').onclick = async () => {
    try {
      const name = document.getElementById('collegeName').value.trim();
      if (!name) throw new Error('Faculty name is required');
      await request('/colleges', { method: 'POST', body: JSON.stringify({ name }) });
      setMessage('success', 'Faculty added');
      clearEntityInputs();
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
      clearEntityInputs();
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
      clearEntityInputs();
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

      await request('/subjects', {
        method: 'POST',
        body: JSON.stringify({ semesterId, subjectCode, subjectName, credits, notes, prerequisiteSubjectIds: [] })
      });
      setMessage('success', 'Subject added');
      clearEntityInputs();
      await loadRelations();
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
      authErrorEl.textContent = 'Invalid credentials. Use Admin/Admin.';
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
bindCrudDelegates();
setupLogin();
