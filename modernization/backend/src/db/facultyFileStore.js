import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataRoot = path.resolve(__dirname, '../../../data');
const facultiesRoot = path.join(dataRoot, 'faculties');
const indexPath = path.join(dataRoot, 'index.json');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, payload) {
  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  fs.renameSync(tmpPath, filePath);
}

function codeSeedFromName(name) {
  const words = String(name || '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !['faculty', 'of', 'the'].includes(w.toLowerCase()));

  if (words.length > 1) return words.map((w) => w[0]).join('').toUpperCase().slice(0, 6);
  if (words.length === 1) return words[0].toUpperCase().slice(0, 6);
  return 'FAC';
}

function nextCode(takenCodes, facultyName) {
  const seed = codeSeedFromName(facultyName);
  if (!takenCodes.has(seed)) return seed;
  let suffix = 2;
  while (takenCodes.has(`${seed}${suffix}`)) suffix += 1;
  return `${seed}${suffix}`;
}

function ensureFacultyScaffold(entry) {
  const dirPath = path.join(facultiesRoot, entry.code);
  ensureDir(dirPath);

  const required = [
    ['faculty.json', {}],
    ['programs.json', { programs: [] }],
    ['years.json', { years: [] }],
    ['semesters.json', { semesters: [] }],
    ['courses.json', { courses: [] }]
  ];

  for (const [name, initial] of required) {
    const filePath = path.join(dirPath, name);
    if (!fs.existsSync(filePath)) writeJson(filePath, initial);
  }
}

function buildFacultyHierarchy(store, entry) {
  const createdAt = entry.createdAt || new Date().toISOString();
  const programs = store.programs
    .filter((program) => program.collegeId === entry.collegeId)
    .map((program) => ({
      id: `prog-${program.id}`,
      facultyId: entry.id,
      code: String(program.name || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10) || `P${program.id}`,
      name: program.name,
      duration: 4,
      description: `${program.name} program`,
      createdAt
    }));

  const programIds = new Map(programs.map((p) => [Number(p.id.replace('prog-', '')), p.id]));

  const years = store.years
    .filter((year) => programIds.has(year.programId))
    .map((year) => ({
      id: `year-${year.id}`,
      programId: programIds.get(year.programId),
      yearNumber: year.yearNumber,
      description: `Year ${year.yearNumber}`,
      createdAt
    }));

  const yearIds = new Map(years.map((y) => [Number(y.id.replace('year-', '')), y.id]));

  const semesters = store.semesters
    .filter((semester) => yearIds.has(semester.yearId))
    .map((semester) => ({
      id: `sem-${semester.id}`,
      yearId: yearIds.get(semester.yearId),
      semesterNumber: semester.semesterNumber,
      description: `Semester ${semester.semesterNumber}`,
      createdAt
    }));

  const semesterIds = new Map(semesters.map((s) => [Number(s.id.replace('sem-', '')), s.id]));

  const courses = store.subjects
    .filter((subject) => semesterIds.has(subject.semesterId))
    .map((subject) => ({
      id: `course-${subject.id}`,
      semesterId: semesterIds.get(subject.semesterId),
      code: subject.subjectCode,
      name: subject.subjectName,
      credits: subject.credits,
      description: subject.notes || '',
      prerequisites: [],
      createdAt
    }));

  return { programs, years, semesters, courses };
}

export function syncFacultyFilesFromRuntime(store) {
  ensureDir(facultiesRoot);
  const index = readJson(indexPath, { faculties: [] });
  const faculties = Array.isArray(index.faculties) ? index.faculties : [];
  const now = new Date().toISOString();

  const takenCodes = new Set(faculties.map((f) => String(f.code || '').toUpperCase()));
  const managedEntriesByCollege = new Map(
    faculties.filter((f) => Number.isFinite(Number(f.collegeId))).map((f) => [Number(f.collegeId), f])
  );

  for (const college of store.colleges) {
    let entry = managedEntriesByCollege.get(college.id);
    if (!entry) {
      const code = nextCode(takenCodes, college.name);
      takenCodes.add(code);
      entry = {
        id: `fac-college-${college.id}`,
        collegeId: college.id,
        code,
        name: college.name,
        description: `${college.name} study plans`,
        path: `faculties/${code}`,
        createdAt: now,
        updatedAt: now
      };
      faculties.push(entry);
      managedEntriesByCollege.set(college.id, entry);
    } else {
      entry.name = college.name;
      entry.path = `faculties/${entry.code}`;
      entry.updatedAt = now;
    }

    ensureFacultyScaffold(entry);
    const hierarchy = buildFacultyHierarchy(store, entry);
    const dirPath = path.join(facultiesRoot, entry.code);

    writeJson(path.join(dirPath, 'faculty.json'), {
      id: entry.id,
      collegeId: entry.collegeId,
      code: entry.code,
      name: entry.name,
      description: entry.description,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt
    });
    writeJson(path.join(dirPath, 'programs.json'), { programs: hierarchy.programs });
    writeJson(path.join(dirPath, 'years.json'), { years: hierarchy.years });
    writeJson(path.join(dirPath, 'semesters.json'), { semesters: hierarchy.semesters });
    writeJson(path.join(dirPath, 'courses.json'), { courses: hierarchy.courses });
  }

  // Clean only entries managed by runtime colleges.
  const activeCollegeIds = new Set(store.colleges.map((c) => c.id));
  const kept = faculties.filter((entry) => {
    if (!Number.isFinite(Number(entry.collegeId))) return true;
    const shouldKeep = activeCollegeIds.has(Number(entry.collegeId));
    if (!shouldKeep) fs.rmSync(path.join(facultiesRoot, entry.code), { recursive: true, force: true });
    return shouldKeep;
  });

  writeJson(indexPath, { faculties: kept });
}
