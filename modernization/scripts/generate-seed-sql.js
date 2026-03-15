import fs from 'node:fs';
import path from 'node:path';

const modelPath = path.resolve('data/academic-plan.json');
const outputPath = path.resolve('db/seeds/001_seed.sql');
const model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));

const esc = (v) => String(v).replace(/'/g, "''");

const lines = [];
lines.push('BEGIN;');
lines.push(`INSERT INTO colleges(name) VALUES ('${esc(model.college.name)}') ON CONFLICT(name) DO NOTHING;`);
lines.push(`INSERT INTO programs(college_id, name)
SELECT c.id, '${esc(model.college.programs[0].name)}' FROM colleges c WHERE c.name='${esc(model.college.name)}'
ON CONFLICT (college_id, name) DO NOTHING;`);

for (const year of model.college.programs[0].years) {
  lines.push(`INSERT INTO years(program_id, year_number)
SELECT p.id, ${year.yearNumber} FROM programs p JOIN colleges c ON c.id=p.college_id
WHERE c.name='${esc(model.college.name)}' AND p.name='${esc(model.college.programs[0].name)}'
ON CONFLICT (program_id, year_number) DO NOTHING;`);

  for (const sem of year.semesters) {
    lines.push(`INSERT INTO semesters(year_id, semester_number)
SELECT y.id, ${sem.semesterNumber} FROM years y
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='${esc(model.college.name)}' AND p.name='${esc(model.college.programs[0].name)}' AND y.year_number=${year.yearNumber}
ON CONFLICT (year_id, semester_number) DO NOTHING;`);

    for (const sub of sem.subjects) {
      lines.push(`INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, '${esc(sub.subjectName)}', '${esc(sub.subjectCode)}', ${sub.credits}, ${sub.notes ? `'${esc(sub.notes)}'` : 'NULL'}
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='${esc(model.college.name)}' AND p.name='${esc(model.college.programs[0].name)}' AND y.year_number=${year.yearNumber} AND s.semester_number=${sem.semesterNumber}
ON CONFLICT (semester_id, subject_code) DO NOTHING;`);
    }
  }
}

lines.push('COMMIT;');
fs.writeFileSync(outputPath, `${lines.join('\n\n')}\n`);
console.log(`Generated ${outputPath}`);
