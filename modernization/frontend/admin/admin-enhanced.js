/**
 * Enhanced Admin System with Validation, Duplicate Detection, and Real-time Sync
 * Features:
 * - Duplicate detection for all entities
 * - Real-time validation with user warnings
 * - Prerequisite conflict detection
 * - Real-time synchronization to student portal
 * - Comprehensive error handling
 */

const apiCandidates = (() => {
  const localApi = 'http://localhost:4000/api';
  const sameOriginApi = `${window.location.origin}/api`;
  if (window.location.origin.includes('localhost:4000')) return ['/api'];
  return [sameOriginApi, localApi];
})();

let workingApiBase = apiCandidates[0];
const ADMIN_USER = 'Admin';
const ADMIN_PASS = 'Admin';

// Enhanced state management
const state = {
  isAuthenticated: false,
  cache: { colleges: [], programs: [], years: [], semesters: [], subjects: [], prerequisites: [] },
  editingId: null,
  editingKind: null,
  lastSyncTime: null
};

// DOM elements
const elements = {
  errorEl: document.getElementById('error'),
  successEl: document.getElementById('success'),
  authErrorEl: document.getElementById('authError'),
  loginCard: document.getElementById('adminLoginCard'),
  dashboard: document.getElementById('adminDashboard'),
  
  // Faculty
  collegeName: document.getElementById('collegeName'),
  addCollegeBtn: document.getElementById('addCollege'),
  collegeList: document.getElementById('collegeList'),
  
  // Program
  programCollege: document.getElementById('programCollege'),
  programName: document.getElementById('programName'),
  addProgramBtn: document.getElementById('addProgram'),
  programList: document.getElementById('programList'),
  
  // Year
  yearProgram: document.getElementById('yearProgram'),
  yearNumber: document.getElementById('yearNumber'),
  addYearBtn: document.getElementById('addYear'),
  yearList: document.getElementById('yearList'),
  
  // Semester
  semesterYear: document.getElementById('semesterYear'),
  semesterNumber: document.getElementById('semesterNumber'),
  addSemesterBtn: document.getElementById('addSemester'),
  semesterList: document.getElementById('semesterList'),
  
  // Subject
  subjectSemester: document.getElementById('subjectSemester'),
  subjectCode: document.getElementById('subjectCode'),
  subjectName: document.getElementById('subjectName'),
  subjectCredits: document.getElementById('subjectCredits'),
  subjectNotes: document.getElementById('subjectNotes'),
  addSubjectBtn: document.getElementById('addSubject'),
  subjectList: document.getElementById('subjectList'),
  
  // Login
  adminUsername: document.getElementById('adminUsername'),
  adminPassword: document.getElementById('adminPassword'),
  adminLoginBtn: document.getElementById('adminLoginBtn')
};

// ============ MESSAGE MANAGEMENT ============
function showMessage(type, message, duration = 4000) {
  elements.errorEl.textContent = type === 'error' ? message : '';
  elements.successEl.textContent = type === 'success' ? message : '';
  
  if (duration && type === 'success') {
    setTimeout(() => {
      elements.successEl.textContent = '';
    }, duration);
  }
}

function showWarning(title, message) {
  return confirm(`⚠️ ${title}\n\n${message}\n\nDo you want to proceed?`);
}

// ============ API COMMUNICATION ============
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
        throw new Error('API unavailable');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      workingApiBase = base;
      return data;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Failed to fetch API');
}

// ============ VALIDATION FUNCTIONS ============
function isDuplicateFaculty(name) {
  return state.cache.colleges.some(c => c.name.toLowerCase() === name.toLowerCase());
}

function isDuplicateProgram(name, collegeId) {
  return state.cache.programs.some(p => 
    p.name.toLowerCase() === name.toLowerCase() && p.collegeId === collegeId
  );
}

function isDuplicateYear(yearNumber, programId) {
  return state.cache.years.some(y => 
    y.yearNumber === yearNumber && y.programId === programId
  );
}

function isDuplicateSemester(semesterNumber, yearId) {
  return state.cache.semesters.some(s => 
    s.semesterNumber === semesterNumber && s.yearId === yearId
  );
}

function isDuplicateSubject(code, semesterId) {
  return state.cache.subjects.some(s => 
    s.subjectCode.toUpperCase() === code.toUpperCase() && s.semesterId === semesterId
  );
}

function hasPrerequisiteConflict(subjectCode, prerequisites) {
  const subject = state.cache.subjects.find(s => s.subjectCode === subjectCode);
  if (!subject) return false;
  
  const existingPrereqs = state.cache.prerequisites.filter(p => p.subjectId === subject.id);
  return existingPrereqs.length > 0 && prerequisites.length > 0;
}

// ============ CRUD OPERATIONS ============

// Faculty Operations
async function addFaculty() {
  const name = elements.collegeName.value.trim();
  if (!name) {
    showMessage('error', '❌ Faculty name is required');
    return;
  }

  if (isDuplicateFaculty(name)) {
    showMessage('error', `❌ Faculty "${name}" already exists`);
    return;
  }

  try {
    await request('/colleges', { 
      method: 'POST', 
      body: JSON.stringify({ name }) 
    });
    showMessage('success', `✅ Faculty "${name}" added successfully`);
    elements.collegeName.value = '';
    await loadData();
    triggerStudentPortalSync();
  } catch (error) {
    showMessage('error', `❌ Error adding faculty: ${error.message}`);
  }
}

// Program Operations
async function addProgram() {
  const collegeId = Number(elements.programCollege.value);
  const name = elements.programName.value.trim();
  
  if (!collegeId) {
    showMessage('error', '❌ Please select a faculty');
    return;
  }
  if (!name) {
    showMessage('error', '❌ Program name is required');
    return;
  }

  if (isDuplicateProgram(name, collegeId)) {
    showMessage('error', `❌ Program "${name}" already exists in this faculty`);
    return;
  }

  try {
    await request('/programs', { 
      method: 'POST', 
      body: JSON.stringify({ collegeId, name }) 
    });
    showMessage('success', `✅ Program "${name}" added successfully`);
    elements.programName.value = '';
    await loadData();
    triggerStudentPortalSync();
  } catch (error) {
    showMessage('error', `❌ Error adding program: ${error.message}`);
  }
}

// Year Operations
async function addYear() {
  const programId = Number(elements.yearProgram.value);
  const yearNumber = Number(elements.yearNumber.value);
  
  if (!programId) {
    showMessage('error', '❌ Please select a program');
    return;
  }
  if (!yearNumber || yearNumber < 1) {
    showMessage('error', '❌ Year number must be at least 1');
    return;
  }

  if (isDuplicateYear(yearNumber, programId)) {
    showMessage('error', `❌ Year ${yearNumber} already exists in this program`);
    return;
  }

  try {
    await request('/years', { 
      method: 'POST', 
      body: JSON.stringify({ programId, yearNumber }) 
    });
    showMessage('success', `✅ Year ${yearNumber} added successfully`);
    elements.yearNumber.value = '';
    await loadData();
    triggerStudentPortalSync();
  } catch (error) {
    showMessage('error', `❌ Error adding year: ${error.message}`);
  }
}

// Semester Operations
async function addSemester() {
  const yearId = Number(elements.semesterYear.value);
  const semesterNumber = Number(elements.semesterNumber.value);
  
  if (!yearId) {
    showMessage('error', '❌ Please select a year');
    return;
  }

  if (isDuplicateSemester(semesterNumber, yearId)) {
    showMessage('error', `❌ Semester ${semesterNumber} already exists in this year`);
    return;
  }

  try {
    await request('/semesters', { 
      method: 'POST', 
      body: JSON.stringify({ yearId, semesterNumber }) 
    });
    showMessage('success', `✅ Semester ${semesterNumber} added successfully`);
    await loadData();
    triggerStudentPortalSync();
  } catch (error) {
    showMessage('error', `❌ Error adding semester: ${error.message}`);
  }
}

// Subject Operations
async function addSubject() {
  const semesterId = Number(elements.subjectSemester.value);
  const subjectCode = elements.subjectCode.value.trim().toUpperCase();
  const subjectName = elements.subjectName.value.trim();
  const credits = Number(elements.subjectCredits.value);
  const notes = elements.subjectNotes.value.trim();
  
  if (!semesterId) {
    showMessage('error', '❌ Please select a semester');
    return;
  }
  if (!subjectCode) {
    showMessage('error', '❌ Subject code is required');
    return;
  }
  if (!subjectName) {
    showMessage('error', '❌ Subject name is required');
    return;
  }
  if (!credits || credits < 1) {
    showMessage('error', '❌ Credits must be at least 1');
    return;
  }

  if (isDuplicateSubject(subjectCode, semesterId)) {
    showMessage('error', `❌ Subject "${subjectCode}" already exists in this semester`);
    return;
  }

  try {
    await request('/subjects', { 
      method: 'POST', 
      body: JSON.stringify({ semesterId, subjectCode, subjectName, credits, notes }) 
    });
    showMessage('success', `✅ Subject "${subjectCode}" added successfully`);
    elements.subjectCode.value = '';
    elements.subjectName.value = '';
    elements.subjectCredits.value = '';
    elements.subjectNotes.value = '';
    await loadData();
    triggerStudentPortalSync();
  } catch (error) {
    showMessage('error', `❌ Error adding subject: ${error.message}`);
  }
}

// Delete Operations
async function deleteEntity(id, kind) {
  if (!confirm(`Are you sure you want to delete this ${kind}? This action cannot be undone.`)) {
    return;
  }

  try {
    const endpoints = {
      college: '/colleges',
      program: '/programs',
      year: '/years',
      semester: '/semesters',
      subject: '/subjects'
    };
    
    await request(`${endpoints[kind]}/${id}`, { method: 'DELETE' });
    showMessage('success', `✅ ${kind.charAt(0).toUpperCase() + kind.slice(1)} deleted successfully`);
    await loadData();
    triggerStudentPortalSync();
  } catch (error) {
    showMessage('error', `❌ Error deleting ${kind}: ${error.message}`);
  }
}

// ============ DATA LOADING & RENDERING ============
async function loadData() {
  try {
    state.cache.colleges = await request('/colleges');
    state.cache.programs = await request('/programs');
    state.cache.years = await request('/years');
    state.cache.semesters = await request('/semesters');
    state.cache.subjects = await request('/subjects');
    state.cache.prerequisites = await request('/prerequisites') || [];
    
    renderSelects();
    renderLists();
    state.lastSyncTime = new Date();
  } catch (error) {
    showMessage('error', `❌ Error loading data: ${error.message}`);
  }
}

function renderSelects() {
  renderOptions(elements.programCollege, state.cache.colleges);
  renderOptions(elements.yearProgram, state.cache.programs);
  renderOptions(elements.semesterYear, state.cache.years, 'yearNumber');
  renderOptions(elements.subjectSemester, state.cache.semesters, 'semesterNumber');
}

function renderOptions(el, items, label = 'name', value = 'id') {
  el.innerHTML = '<option value="">Select...</option>' + items
    .map((i) => `<option value="${i[value]}">${i[label] ?? i.yearNumber ?? i.semesterNumber}</option>`)
    .join('');
}

function lookupName(collection, id, key = 'name') {
  return collection.find((item) => item.id === id)?.[key] ?? '-';
}

function renderLists() {
  // Faculties
  elements.collegeList.innerHTML = state.cache.colleges
    .map((c) => `
      <div class="entity-row">
        <span>${c.name}</span>
        <div class="actions">
          <button data-edit="${c.id}" data-kind="college">Edit</button>
          <button class="danger" data-delete="${c.id}" data-kind="college">Delete</button>
        </div>
      </div>
    `).join('') || '<p>No faculties yet.</p>';

  // Programs
  elements.programList.innerHTML = state.cache.programs
    .map((p) => `
      <div class="entity-row">
        <span>${p.name} (${lookupName(state.cache.colleges, p.collegeId)})</span>
        <div class="actions">
          <button data-edit="${p.id}" data-kind="program">Edit</button>
          <button class="danger" data-delete="${p.id}" data-kind="program">Delete</button>
        </div>
      </div>
    `).join('') || '<p>No programs yet.</p>';

  // Years
  elements.yearList.innerHTML = state.cache.years
    .map((y) => `
      <div class="entity-row">
        <span>Year ${y.yearNumber} (${lookupName(state.cache.programs, y.programId)})</span>
        <div class="actions">
          <button data-edit="${y.id}" data-kind="year">Edit</button>
          <button class="danger" data-delete="${y.id}" data-kind="year">Delete</button>
        </div>
      </div>
    `).join('') || '<p>No years yet.</p>';

  // Semesters
  elements.semesterList.innerHTML = state.cache.semesters
    .map((s) => `
      <div class="entity-row">
        <span>Semester ${s.semesterNumber} (Year ${lookupName(state.cache.years, s.yearId, 'yearNumber')})</span>
        <div class="actions">
          <button data-edit="${s.id}" data-kind="semester">Edit</button>
          <button class="danger" data-delete="${s.id}" data-kind="semester">Delete</button>
        </div>
      </div>
    `).join('') || '<p>No semesters yet.</p>';

  // Subjects
  elements.subjectList.innerHTML = state.cache.subjects
    .map((s) => `
      <tr>
        <td>${s.subjectCode}</td>
        <td>${s.subjectName}</td>
        <td>${s.credits}</td>
        <td>Semester ${lookupName(state.cache.semesters, s.semesterId, 'semesterNumber')}</td>
        <td>
          <button data-edit="${s.id}" data-kind="subject">Edit</button>
          <button class="danger" data-delete="${s.id}" data-kind="subject">Delete</button>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="5">No subjects yet.</td></tr>';
}

// ============ REAL-TIME SYNCHRONIZATION ============
function triggerStudentPortalSync() {
  // Broadcast to all tabs/windows
  localStorage.setItem('studyPlanUpdate', JSON.stringify({
    timestamp: new Date().toISOString(),
    type: 'data-updated'
  }));
  
  // Also trigger a custom event
  window.dispatchEvent(new CustomEvent('studyPlanDataUpdated', {
    detail: { timestamp: new Date() }
  }));
}

// Listen for updates from other tabs
window.addEventListener('storage', (event) => {
  if (event.key === 'studyPlanUpdate') {
    loadData();
  }
});

// ============ EVENT LISTENERS ============
elements.adminLoginBtn.addEventListener('click', async () => {
  const username = elements.adminUsername.value;
  const password = elements.adminPassword.value;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    state.isAuthenticated = true;
    elements.loginCard.hidden = true;
    elements.dashboard.hidden = false;
    elements.adminUsername.value = '';
    elements.adminPassword.value = '';
    await loadData();
  } else {
    elements.authErrorEl.textContent = '❌ Invalid credentials';
  }
});

elements.addCollegeBtn.addEventListener('click', addFaculty);
elements.addProgramBtn.addEventListener('click', addProgram);
elements.addYearBtn.addEventListener('click', addYear);
elements.addSemesterBtn.addEventListener('click', addSemester);
elements.addSubjectBtn.addEventListener('click', addSubject);

// Event delegation for edit/delete
document.body.addEventListener('click', async (event) => {
  const editBtn = event.target.closest('[data-edit]');
  const deleteBtn = event.target.closest('[data-delete]');

  if (editBtn) {
    const id = Number(editBtn.dataset.edit);
    const kind = editBtn.dataset.kind;
    
    if (kind === 'college') {
      const current = state.cache.colleges.find((x) => x.id === id);
      const name = prompt('New faculty name:', current?.name || '');
      if (!name) return;
      try {
        await request(`/colleges/${id}`, { method: 'PUT', body: JSON.stringify({ name }) });
        showMessage('success', '✅ Faculty updated successfully');
        await loadData();
        triggerStudentPortalSync();
      } catch (error) {
        showMessage('error', `❌ Error updating faculty: ${error.message}`);
      }
    }
  }

  if (deleteBtn) {
    const id = Number(deleteBtn.dataset.delete);
    const kind = deleteBtn.dataset.kind;
    await deleteEntity(id, kind);
  }
});

// Auto-refresh data every 30 seconds
setInterval(async () => {
  if (state.isAuthenticated) {
    await loadData();
  }
}, 30000);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('Enhanced Admin System Initialized');
});
