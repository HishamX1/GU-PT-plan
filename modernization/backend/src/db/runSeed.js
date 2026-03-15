import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { saveStore, nextId, freshStore } from './store.js';

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
const store = freshStore();

const college = { id: nextId(store, 'colleges'), name: model.college.name };
store.colleges.push(college);

const programData = model.college.programs[0];
const program = { id: nextId(store, 'programs'), collegeId: college.id, name: programData.name };
store.programs.push(program);

const subjectIdByCode = new Map();

for (const y of programData.years) {
  const year = { id: nextId(store, 'years'), programId: program.id, yearNumber: y.yearNumber };
  store.years.push(year);

  for (const sem of y.semesters) {
    const semester = { id: nextId(store, 'semesters'), yearId: year.id, semesterNumber: sem.semesterNumber };
    store.semesters.push(semester);

    for (const sub of sem.subjects) {
      const subject = {
        id: nextId(store, 'subjects'),
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
    store.subjectPrerequisites.push({
      subjectId: subject.id,
      prerequisiteSubjectId: prereqId
    });
  }
}

saveStore(store);
console.log(`Seed completed to file-based store (${store.subjects.length} subjects, ${store.subjectPrerequisites.length} prerequisite links).`);
