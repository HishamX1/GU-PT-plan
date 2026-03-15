import { loadStore, saveStore, nextId } from '../db/store.js';

export function getColleges() {
  return loadStore().colleges.sort((a, b) => a.name.localeCompare(b.name));
}

export function createCollege(data) {
  const store = loadStore();
  if (store.colleges.some((c) => c.name.toLowerCase() === data.name.toLowerCase())) return null;
  const row = { id: nextId(store, 'colleges'), name: data.name.trim() };
  store.colleges.push(row);
  saveStore(store);
  return row;
}

export function getPrograms(collegeId) {
  const store = loadStore();
  return store.programs.filter((p) => !collegeId || p.collegeId === collegeId);
}

export function createProgram(data) {
  const store = loadStore();
  if (!store.colleges.some((c) => c.id === data.collegeId)) throw new Error('FK_COLLEGE');
  if (store.programs.some((p) => p.collegeId === data.collegeId && p.name.toLowerCase() === data.name.toLowerCase())) return null;
  const row = { id: nextId(store, 'programs'), collegeId: data.collegeId, name: data.name.trim() };
  store.programs.push(row);
  saveStore(store);
  return row;
}

export function getYears(programId) {
  const store = loadStore();
  return store.years.filter((y) => !programId || y.programId === programId);
}

export function createYear(data) {
  const store = loadStore();
  if (!store.programs.some((p) => p.id === data.programId)) throw new Error('FK_PROGRAM');
  if (store.years.some((y) => y.programId === data.programId && y.yearNumber === data.yearNumber)) return null;
  const row = { id: nextId(store, 'years'), programId: data.programId, yearNumber: data.yearNumber };
  store.years.push(row);
  saveStore(store);
  return row;
}

export function getSemesters(yearId) {
  const store = loadStore();
  return store.semesters.filter((s) => !yearId || s.yearId === yearId);
}

export function createSemester(data) {
  const store = loadStore();
  if (!store.years.some((y) => y.id === data.yearId)) throw new Error('FK_YEAR');
  if (store.semesters.some((s) => s.yearId === data.yearId && s.semesterNumber === data.semesterNumber)) return null;
  const row = { id: nextId(store, 'semesters'), yearId: data.yearId, semesterNumber: data.semesterNumber };
  store.semesters.push(row);
  saveStore(store);
  return row;
}

export function getSubjects(filters = {}) {
  const store = loadStore();
  const semesters = new Map(store.semesters.map((s) => [s.id, s]));
  const years = new Map(store.years.map((y) => [y.id, y]));

  return store.subjects
    .filter((s) => !filters.semesterId || s.semesterId === filters.semesterId)
    .filter((s) => {
      const sem = semesters.get(s.semesterId);
      return !filters.yearId || sem?.yearId === filters.yearId;
    })
    .filter((s) => {
      if (!filters.programId) return true;
      const sem = semesters.get(s.semesterId);
      const year = years.get(sem?.yearId);
      return year?.programId === filters.programId;
    });
}

export function createSubject(data) {
  const store = loadStore();
  if (!store.semesters.some((s) => s.id === data.semesterId)) throw new Error('FK_SEMESTER');
  if (store.subjects.some((s) => s.semesterId === data.semesterId && s.subjectCode.toLowerCase() === data.subjectCode.toLowerCase())) return null;

  const row = {
    id: nextId(store, 'subjects'),
    semesterId: data.semesterId,
    subjectName: data.subjectName.trim(),
    subjectCode: data.subjectCode.trim(),
    credits: data.credits,
    notes: data.notes || null
  };

  store.subjects.push(row);
  for (const prereqId of data.prerequisiteSubjectIds || []) {
    if (!store.subjects.some((s) => s.id === prereqId)) throw new Error('FK_SUBJECT');
    if (prereqId === row.id) continue;
    if (!store.subjectPrerequisites.some((r) => r.subjectId === row.id && r.prerequisiteSubjectId === prereqId)) {
      store.subjectPrerequisites.push({ subjectId: row.id, prerequisiteSubjectId: prereqId });
    }
  }

  saveStore(store);
  return row;
}
