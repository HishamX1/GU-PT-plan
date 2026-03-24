import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';
import { query, closePool, withFileStore } from './client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const modelPath = path.resolve(__dirname, '../../../data/academic-plan.json');
const repoRoot = path.resolve(__dirname, '../../../../');
const sourcePath = path.resolve(repoRoot, 'data.js');

function readPrereqMap() {
  const source = fs.readFileSync(sourcePath, 'utf8');
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${source}\nthis.__courses = courses;`, context);
  const courses = context.__courses || [];
  return new Map(courses.map((course) => [course.code, course.prerequisites || []]));
}

const model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
const prereqMap = readPrereqMap();

if (env.dataMode === 'postgres') {
  await query('TRUNCATE subject_prerequisites, subjects, semesters, years, programs, colleges RESTART IDENTITY CASCADE');

  const collegeRes = await query('INSERT INTO colleges(name) VALUES ($1) RETURNING id', [model.college.name]);
  const collegeId = collegeRes.rows[0].id;

  const programData = model.college.programs[0];
  const programRes = await query('INSERT INTO programs(college_id, name) VALUES ($1, $2) RETURNING id', [collegeId, programData.name]);
  const programId = programRes.rows[0].id;

  const subjectIdByCode = new Map();

  for (const y of programData.years) {
    const yearRes = await query('INSERT INTO years(program_id, year_number) VALUES ($1, $2) RETURNING id', [programId, y.yearNumber]);
    const yearId = yearRes.rows[0].id;

    for (const sem of y.semesters) {
      const semRes = await query('INSERT INTO semesters(year_id, semester_number) VALUES ($1, $2) RETURNING id', [yearId, sem.semesterNumber]);
      const semesterId = semRes.rows[0].id;

      for (const sub of sem.subjects) {
        const subjectRes = await query(
          'INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [semesterId, sub.subjectName, sub.subjectCode, sub.credits, sub.notes || null]
        );
        subjectIdByCode.set(sub.subjectCode, subjectRes.rows[0].id);
      }
    }
  }

  let links = 0;
  for (const [code, subjectId] of subjectIdByCode.entries()) {
    const prereqCodes = prereqMap.get(code) || [];
    for (const prereqCode of prereqCodes) {
      const prereqId = subjectIdByCode.get(prereqCode);
      if (!prereqId || prereqId === subjectId) continue;
      await query(
        'INSERT INTO subject_prerequisites(subject_id, prerequisite_subject_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [subjectId, prereqId]
      );
      links += 1;
    }
  }

  await closePool();
  console.log(`Seed completed to PostgreSQL (${subjectIdByCode.size} subjects, ${links} prerequisite links).`);
} else {
  const store = {
    colleges: [],
    programs: [],
    years: [],
    semesters: [],
    subjects: [],
    subjectPrerequisites: [],
    counters: { colleges: 1, programs: 1, years: 1, semesters: 1, subjects: 1 }
  };

  const nextId = (key) => {
    const id = store.counters[key];
    store.counters[key] += 1;
    return id;
  };

  const college = { id: nextId('colleges'), name: model.college.name };
  store.colleges.push(college);

  const programData = model.college.programs[0];
  const program = { id: nextId('programs'), collegeId: college.id, name: programData.name };
  store.programs.push(program);

  const subjectIdByCode = new Map();

  for (const y of programData.years) {
    const year = { id: nextId('years'), programId: program.id, yearNumber: y.yearNumber };
    store.years.push(year);

    for (const sem of y.semesters) {
      const semester = { id: nextId('semesters'), yearId: year.id, semesterNumber: sem.semesterNumber };
      store.semesters.push(semester);

      for (const sub of sem.subjects) {
        const subject = {
          id: nextId('subjects'),
          semesterId: semester.id,
          subjectName: sub.subjectName,
          subjectCode: sub.subjectCode,
          credits: sub.credits,
          notes: sub.notes
        };
        store.subjects.push(subject);
        subjectIdByCode.set(subject.subjectCode, subject.id);
      }
    }
  }

  for (const subject of store.subjects) {
    const prereqCodes = prereqMap.get(subject.subjectCode) || [];
    for (const prereqCode of prereqCodes) {
      const prereqId = subjectIdByCode.get(prereqCode);
      if (!prereqId || prereqId === subject.id) continue;
      store.subjectPrerequisites.push({ subjectId: subject.id, prerequisiteSubjectId: prereqId });
    }
  }

  withFileStore((target) => {
    Object.assign(target, store);
    return null;
  });
  console.log(`Seed completed to file-based store (${store.subjects.length} subjects, ${store.subjectPrerequisites.length} prerequisite links).`);
}
