import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');
const sourcePath = path.join(rootDir, 'data.js');
const outputPath = path.resolve(__dirname, '..', 'data', 'academic-plan.json');

const source = fs.readFileSync(sourcePath, 'utf8');
const context = { window: {} };
vm.createContext(context);
try {
  vm.runInContext(`${source}\nthis.__courses = courses;`, context);
} catch (e) {
  // If window.courses is set, use that
  if (context.window.courses) {
    context.__courses = context.window.courses;
  } else {
    throw e;
  }
}

const courses = context.__courses || [];
const collegeName = 'Galala University';
const programName = 'Physical Therapy Program';

const yearsMap = new Map();

for (const course of courses) {
  const yearNumber = Math.ceil(course.semester / 2);
  const semesterNumber = course.semester % 2 === 1 ? 1 : 2;

  if (!yearsMap.has(yearNumber)) {
    yearsMap.set(yearNumber, {
      yearNumber,
      semesters: new Map()
    });
  }

  const year = yearsMap.get(yearNumber);
  if (!year.semesters.has(semesterNumber)) {
    year.semesters.set(semesterNumber, {
      semesterNumber,
      subjects: []
    });
  }

  const notes = [];
  if (course.prerequisites?.length) {
    notes.push(`Prerequisites: ${course.prerequisites.join(', ')}`);
  }
  const unknownPrereqs = (course.prerequisites || []).filter(
    (code) => !courses.some((c) => c.code === code)
  );
  if (unknownPrereqs.length) {
    notes.push(`Missing in source dataset: ${unknownPrereqs.join(', ')}`);
  }

  year.semesters.get(semesterNumber).subjects.push({
    subjectName: course.name,
    subjectCode: course.code,
    credits: course.credits,
    notes: notes.join(' | ') || null
  });
}

const years = [...yearsMap.values()]
  .sort((a, b) => a.yearNumber - b.yearNumber)
  .map((year) => ({
    yearNumber: year.yearNumber,
    semesters: [...year.semesters.values()]
      .sort((a, b) => a.semesterNumber - b.semesterNumber)
      .map((semester) => ({
        semesterNumber: semester.semesterNumber,
        subjects: semester.subjects.sort((a, b) =>
          a.subjectCode.localeCompare(b.subjectCode)
        )
      }))
  }));

const model = {
  extractedAt: new Date().toISOString(),
  college: {
    name: collegeName,
    programs: [
      {
        name: programName,
        years
      }
    ]
  },
  sourceSummary: {
    totalSubjects: courses.length,
    totalYears: years.length,
    totalSemesters: years.reduce((acc, y) => acc + y.semesters.length, 0)
  }
};

fs.writeFileSync(outputPath, `${JSON.stringify(model, null, 2)}\n`);
console.log(`Academic plan extracted to ${outputPath}`);
