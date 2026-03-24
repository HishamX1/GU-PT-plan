import { env } from '../config/env.js';
import { query, readFileStore, withFileStore } from '../db/client.js';

function duplicate(error) {
  return String(error?.code) === '23505';
}

export async function getColleges() {
  if (env.dataMode === 'postgres') {
    const { rows } = await query('SELECT id, name FROM colleges ORDER BY name');
    return rows;
  }
  return readFileStore((store) => store.colleges.sort((a, b) => a.name.localeCompare(b.name)));
}

export async function createCollege(data) {
  if (env.dataMode === 'postgres') {
    try {
      const { rows } = await query('INSERT INTO colleges (name) VALUES ($1) RETURNING id, name', [data.name.trim()]);
      return rows[0];
    } catch (error) {
      if (duplicate(error)) return null;
      throw error;
    }
  }

  return withFileStore((store, nextId) => {
    if (store.colleges.some((c) => c.name.toLowerCase() === data.name.toLowerCase())) return null;
    const row = { id: nextId(store, 'colleges'), name: data.name.trim() };
    store.colleges.push(row);
    return row;
  });
}

export async function getPrograms(collegeId) {
  if (env.dataMode === 'postgres') {
    const { rows } = await query(
      'SELECT id, college_id AS "collegeId", name FROM programs WHERE ($1::bigint IS NULL OR college_id = $1) ORDER BY name',
      [collegeId || null]
    );
    return rows;
  }

  return readFileStore((store) => store.programs.filter((p) => !collegeId || p.collegeId === collegeId));
}

export async function createProgram(data) {
  if (env.dataMode === 'postgres') {
    try {
      const { rowCount: c } = await query('SELECT 1 FROM colleges WHERE id = $1', [data.collegeId]);
      if (!c) throw new Error('FK_COLLEGE');
      const { rows } = await query(
        'INSERT INTO programs (college_id, name) VALUES ($1, $2) RETURNING id, college_id AS "collegeId", name',
        [data.collegeId, data.name.trim()]
      );
      return rows[0];
    } catch (error) {
      if (duplicate(error)) return null;
      throw error;
    }
  }

  return withFileStore((store, nextId) => {
    if (!store.colleges.some((c) => c.id === data.collegeId)) throw new Error('FK_COLLEGE');
    if (store.programs.some((p) => p.collegeId === data.collegeId && p.name.toLowerCase() === data.name.toLowerCase())) return null;
    const row = { id: nextId(store, 'programs'), collegeId: data.collegeId, name: data.name.trim() };
    store.programs.push(row);
    return row;
  });
}

export async function getYears(programId) {
  if (env.dataMode === 'postgres') {
    const { rows } = await query(
      'SELECT id, program_id AS "programId", year_number AS "yearNumber" FROM years WHERE ($1::bigint IS NULL OR program_id = $1) ORDER BY year_number',
      [programId || null]
    );
    return rows;
  }

  return readFileStore((store) => store.years.filter((y) => !programId || y.programId === programId));
}

export async function createYear(data) {
  if (env.dataMode === 'postgres') {
    try {
      const { rowCount: c } = await query('SELECT 1 FROM programs WHERE id = $1', [data.programId]);
      if (!c) throw new Error('FK_PROGRAM');
      const { rows } = await query(
        'INSERT INTO years (program_id, year_number) VALUES ($1, $2) RETURNING id, program_id AS "programId", year_number AS "yearNumber"',
        [data.programId, data.yearNumber]
      );
      return rows[0];
    } catch (error) {
      if (duplicate(error)) return null;
      throw error;
    }
  }

  return withFileStore((store, nextId) => {
    if (!store.programs.some((p) => p.id === data.programId)) throw new Error('FK_PROGRAM');
    if (store.years.some((y) => y.programId === data.programId && y.yearNumber === data.yearNumber)) return null;
    const row = { id: nextId(store, 'years'), programId: data.programId, yearNumber: data.yearNumber };
    store.years.push(row);
    return row;
  });
}

export async function getSemesters(yearId) {
  if (env.dataMode === 'postgres') {
    const { rows } = await query(
      'SELECT id, year_id AS "yearId", semester_number AS "semesterNumber" FROM semesters WHERE ($1::bigint IS NULL OR year_id = $1) ORDER BY semester_number',
      [yearId || null]
    );
    return rows;
  }

  return readFileStore((store) => store.semesters.filter((s) => !yearId || s.yearId === yearId));
}

export async function createSemester(data) {
  if (env.dataMode === 'postgres') {
    try {
      const { rowCount: c } = await query('SELECT 1 FROM years WHERE id = $1', [data.yearId]);
      if (!c) throw new Error('FK_YEAR');
      const { rows } = await query(
        'INSERT INTO semesters (year_id, semester_number) VALUES ($1, $2) RETURNING id, year_id AS "yearId", semester_number AS "semesterNumber"',
        [data.yearId, data.semesterNumber]
      );
      return rows[0];
    } catch (error) {
      if (duplicate(error)) return null;
      throw error;
    }
  }

  return withFileStore((store, nextId) => {
    if (!store.years.some((y) => y.id === data.yearId)) throw new Error('FK_YEAR');
    if (store.semesters.some((s) => s.yearId === data.yearId && s.semesterNumber === data.semesterNumber)) return null;
    const row = { id: nextId(store, 'semesters'), yearId: data.yearId, semesterNumber: data.semesterNumber };
    store.semesters.push(row);
    return row;
  });
}

function fileSubjectFilter(store, filters) {
  const semesters = new Map(store.semesters.map((s) => [s.id, s]));
  const years = new Map(store.years.map((y) => [y.id, y]));
  const programs = new Map(store.programs.map((p) => [p.id, p]));

  return store.subjects
    .filter((s) => !filters.semesterId || s.semesterId === filters.semesterId)
    .filter((s) => {
      const sem = semesters.get(s.semesterId);
      return !filters.yearId || sem?.yearId === filters.yearId;
    })
    .filter((s) => {
      const sem = semesters.get(s.semesterId);
      const year = years.get(sem?.yearId);
      return !filters.programId || year?.programId === filters.programId;
    })
    .filter((s) => {
      const sem = semesters.get(s.semesterId);
      const year = years.get(sem?.yearId);
      const program = programs.get(year?.programId);
      return !filters.collegeId || program?.collegeId === filters.collegeId;
    });
}

export async function getSubjects(filters = {}) {
  if (env.dataMode === 'postgres') {
    const { rows } = await query(
      `SELECT s.id, s.semester_id AS "semesterId", s.subject_name AS "subjectName", s.subject_code AS "subjectCode", s.credits, s.notes
       FROM subjects s
       JOIN semesters sem ON sem.id = s.semester_id
       JOIN years y ON y.id = sem.year_id
       JOIN programs p ON p.id = y.program_id
       WHERE ($1::bigint IS NULL OR s.semester_id = $1)
         AND ($2::bigint IS NULL OR sem.year_id = $2)
         AND ($3::bigint IS NULL OR y.program_id = $3)
         AND ($4::bigint IS NULL OR p.college_id = $4)
       ORDER BY s.subject_code`,
      [filters.semesterId || null, filters.yearId || null, filters.programId || null, filters.collegeId || null]
    );
    return rows;
  }

  return readFileStore((store) => fileSubjectFilter(store, filters));
}

async function assertHierarchy(filters) {
  if (!filters.semesterId || !filters.yearId || !filters.programId || !filters.collegeId) return;
  const { rowCount } = await query(
    `SELECT 1
       FROM semesters sem
       JOIN years y ON y.id = sem.year_id
       JOIN programs p ON p.id = y.program_id
      WHERE sem.id = $1 AND y.id = $2 AND p.id = $3 AND p.college_id = $4`,
    [filters.semesterId, filters.yearId, filters.programId, filters.collegeId]
  );
  if (!rowCount) throw new Error('FK_HIERARCHY');
}

export async function createSubject(data) {
  if (env.dataMode === 'postgres') {
    await assertHierarchy(data);
    const clientSubject = await query('SELECT year_id FROM semesters WHERE id = $1', [data.semesterId]);
    if (!clientSubject.rowCount) throw new Error('FK_SEMESTER');

    try {
      const { rows } = await query(
        `INSERT INTO subjects (semester_id, subject_name, subject_code, credits, notes)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, semester_id AS "semesterId", subject_name AS "subjectName", subject_code AS "subjectCode", credits, notes`,
        [data.semesterId, data.subjectName.trim(), data.subjectCode.trim(), data.credits, data.notes || null]
      );
      const subject = rows[0];

      for (const prereqId of data.prerequisiteSubjectIds || []) {
        const exists = await query('SELECT 1 FROM subjects WHERE id = $1', [prereqId]);
        if (!exists.rowCount) throw new Error('FK_SUBJECT');
        if (prereqId === subject.id) continue;
        await query(
          'INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [subject.id, prereqId]
        );
      }

      return subject;
    } catch (error) {
      if (duplicate(error)) return null;
      throw error;
    }
  }

  return withFileStore((store, nextId) => {
    if (!store.semesters.some((s) => s.id === data.semesterId)) throw new Error('FK_SEMESTER');

    if (data.collegeId && data.programId && data.yearId) {
      const semester = store.semesters.find((s) => s.id === data.semesterId);
      const year = store.years.find((y) => y.id === semester?.yearId);
      const program = store.programs.find((p) => p.id === year?.programId);
      if (!semester || !year || !program || year.id !== data.yearId || program.id !== data.programId || program.collegeId !== data.collegeId) {
        throw new Error('FK_HIERARCHY');
      }
    }
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

    return row;
  });
}
