import { env } from '../config/env.js';
import { query, readFileStore, withFileStore } from '../db/client.js';

function duplicate(error) {
  return String(error?.code) === '23505';
}

function notFound(result) {
  return !result || !result.rowCount;
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

export async function updateCollege(id, data) {
  if (env.dataMode === 'postgres') {
    try {
      const { rows, rowCount } = await query('UPDATE colleges SET name = COALESCE($2, name) WHERE id = $1 RETURNING id, name', [
        id,
        data.name?.trim()
      ]);
      if (!rowCount) return false;
      return rows[0];
    } catch (error) {
      if (duplicate(error)) return null;
      throw error;
    }
  }

  return withFileStore((store) => {
    const college = store.colleges.find((c) => c.id === id);
    if (!college) return false;
    if (data.name) {
      const name = data.name.trim();
      if (store.colleges.some((c) => c.id !== id && c.name.toLowerCase() === name.toLowerCase())) return null;
      college.name = name;
    }
    return college;
  });
}

export async function deleteCollege(id) {
  if (env.dataMode === 'postgres') {
    const { rowCount } = await query('DELETE FROM colleges WHERE id = $1', [id]);
    return rowCount > 0;
  }

  return withFileStore((store) => {
    const before = store.colleges.length;
    const programsToDelete = store.programs.filter((p) => p.collegeId === id).map((p) => p.id);
    const yearsToDelete = store.years.filter((y) => programsToDelete.includes(y.programId)).map((y) => y.id);
    const semestersToDelete = store.semesters.filter((s) => yearsToDelete.includes(s.yearId)).map((s) => s.id);
    const subjectsToDelete = store.subjects.filter((s) => semestersToDelete.includes(s.semesterId)).map((s) => s.id);

    store.subjectPrerequisites = store.subjectPrerequisites.filter(
      (p) => !subjectsToDelete.includes(p.subjectId) && !subjectsToDelete.includes(p.prerequisiteSubjectId)
    );
    store.subjects = store.subjects.filter((s) => !subjectsToDelete.includes(s.id));
    store.semesters = store.semesters.filter((s) => !semestersToDelete.includes(s.id));
    store.years = store.years.filter((y) => !yearsToDelete.includes(y.id));
    store.programs = store.programs.filter((p) => !programsToDelete.includes(p.id));
    store.colleges = store.colleges.filter((c) => c.id !== id);

    return before !== store.colleges.length;
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

export async function updateProgram(id, data) {
  if (env.dataMode === 'postgres') {
    try {
      if (data.collegeId) {
        const collegeExists = await query('SELECT 1 FROM colleges WHERE id = $1', [data.collegeId]);
        if (notFound(collegeExists)) throw new Error('FK_COLLEGE');
      }
      const { rows, rowCount } = await query(
        'UPDATE programs SET college_id = COALESCE($2, college_id), name = COALESCE($3, name) WHERE id = $1 RETURNING id, college_id AS "collegeId", name',
        [id, data.collegeId, data.name?.trim()]
      );
      if (!rowCount) return false;
      return rows[0];
    } catch (error) {
      if (duplicate(error)) return null;
      throw error;
    }
  }

  return withFileStore((store) => {
    const program = store.programs.find((p) => p.id === id);
    if (!program) return false;

    const nextCollegeId = data.collegeId ?? program.collegeId;
    const nextName = data.name ? data.name.trim() : program.name;

    if (!store.colleges.some((c) => c.id === nextCollegeId)) throw new Error('FK_COLLEGE');
    if (store.programs.some((p) => p.id !== id && p.collegeId === nextCollegeId && p.name.toLowerCase() === nextName.toLowerCase())) return null;

    program.collegeId = nextCollegeId;
    program.name = nextName;
    return program;
  });
}

export async function deleteProgram(id) {
  if (env.dataMode === 'postgres') {
    const { rowCount } = await query('DELETE FROM programs WHERE id = $1', [id]);
    return rowCount > 0;
  }

  return withFileStore((store) => {
    const before = store.programs.length;
    const yearsToDelete = store.years.filter((y) => y.programId === id).map((y) => y.id);
    const semestersToDelete = store.semesters.filter((s) => yearsToDelete.includes(s.yearId)).map((s) => s.id);
    const subjectsToDelete = store.subjects.filter((s) => semestersToDelete.includes(s.semesterId)).map((s) => s.id);

    store.subjectPrerequisites = store.subjectPrerequisites.filter(
      (p) => !subjectsToDelete.includes(p.subjectId) && !subjectsToDelete.includes(p.prerequisiteSubjectId)
    );
    store.subjects = store.subjects.filter((s) => !subjectsToDelete.includes(s.id));
    store.semesters = store.semesters.filter((s) => !semestersToDelete.includes(s.id));
    store.years = store.years.filter((y) => !yearsToDelete.includes(y.id));
    store.programs = store.programs.filter((p) => p.id !== id);

    return before !== store.programs.length;
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

export async function updateYear(id, data) {
  if (env.dataMode === 'postgres') {
    try {
      if (data.programId) {
        const programExists = await query('SELECT 1 FROM programs WHERE id = $1', [data.programId]);
        if (notFound(programExists)) throw new Error('FK_PROGRAM');
      }
      const { rows, rowCount } = await query(
        'UPDATE years SET program_id = COALESCE($2, program_id), year_number = COALESCE($3, year_number) WHERE id = $1 RETURNING id, program_id AS "programId", year_number AS "yearNumber"',
        [id, data.programId, data.yearNumber]
      );
      if (!rowCount) return false;
      return rows[0];
    } catch (error) {
      if (duplicate(error)) return null;
      throw error;
    }
  }

  return withFileStore((store) => {
    const year = store.years.find((y) => y.id === id);
    if (!year) return false;

    const nextProgramId = data.programId ?? year.programId;
    const nextYear = data.yearNumber ?? year.yearNumber;

    if (!store.programs.some((p) => p.id === nextProgramId)) throw new Error('FK_PROGRAM');
    if (store.years.some((y) => y.id !== id && y.programId === nextProgramId && y.yearNumber === nextYear)) return null;

    year.programId = nextProgramId;
    year.yearNumber = nextYear;
    return year;
  });
}

export async function deleteYear(id) {
  if (env.dataMode === 'postgres') {
    const { rowCount } = await query('DELETE FROM years WHERE id = $1', [id]);
    return rowCount > 0;
  }

  return withFileStore((store) => {
    const before = store.years.length;
    const semestersToDelete = store.semesters.filter((s) => s.yearId === id).map((s) => s.id);
    const subjectsToDelete = store.subjects.filter((s) => semestersToDelete.includes(s.semesterId)).map((s) => s.id);

    store.subjectPrerequisites = store.subjectPrerequisites.filter(
      (p) => !subjectsToDelete.includes(p.subjectId) && !subjectsToDelete.includes(p.prerequisiteSubjectId)
    );
    store.subjects = store.subjects.filter((s) => !subjectsToDelete.includes(s.id));
    store.semesters = store.semesters.filter((s) => !semestersToDelete.includes(s.id));
    store.years = store.years.filter((y) => y.id !== id);

    return before !== store.years.length;
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

export async function updateSemester(id, data) {
  if (env.dataMode === 'postgres') {
    try {
      if (data.yearId) {
        const yearExists = await query('SELECT 1 FROM years WHERE id = $1', [data.yearId]);
        if (notFound(yearExists)) throw new Error('FK_YEAR');
      }
      const { rows, rowCount } = await query(
        'UPDATE semesters SET year_id = COALESCE($2, year_id), semester_number = COALESCE($3, semester_number) WHERE id = $1 RETURNING id, year_id AS "yearId", semester_number AS "semesterNumber"',
        [id, data.yearId, data.semesterNumber]
      );
      if (!rowCount) return false;
      return rows[0];
    } catch (error) {
      if (duplicate(error)) return null;
      throw error;
    }
  }

  return withFileStore((store) => {
    const sem = store.semesters.find((s) => s.id === id);
    if (!sem) return false;

    const nextYearId = data.yearId ?? sem.yearId;
    const nextSemester = data.semesterNumber ?? sem.semesterNumber;

    if (!store.years.some((y) => y.id === nextYearId)) throw new Error('FK_YEAR');
    if (store.semesters.some((s) => s.id !== id && s.yearId === nextYearId && s.semesterNumber === nextSemester)) return null;

    sem.yearId = nextYearId;
    sem.semesterNumber = nextSemester;
    return sem;
  });
}

export async function deleteSemester(id) {
  if (env.dataMode === 'postgres') {
    const { rowCount } = await query('DELETE FROM semesters WHERE id = $1', [id]);
    return rowCount > 0;
  }

  return withFileStore((store) => {
    const before = store.semesters.length;
    const subjectsToDelete = store.subjects.filter((s) => s.semesterId === id).map((s) => s.id);

    store.subjectPrerequisites = store.subjectPrerequisites.filter(
      (p) => !subjectsToDelete.includes(p.subjectId) && !subjectsToDelete.includes(p.prerequisiteSubjectId)
    );
    store.subjects = store.subjects.filter((s) => !subjectsToDelete.includes(s.id));
    store.semesters = store.semesters.filter((s) => s.id !== id);

    return before !== store.semesters.length;
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

export async function updateSubject(id, data) {
  if (env.dataMode === 'postgres') {
    try {
      if (data.semesterId) {
        const sem = await query('SELECT 1 FROM semesters WHERE id = $1', [data.semesterId]);
        if (notFound(sem)) throw new Error('FK_SEMESTER');
      }

      const { rows, rowCount } = await query(
        `UPDATE subjects
            SET semester_id = COALESCE($2, semester_id),
                subject_name = COALESCE($3, subject_name),
                subject_code = COALESCE($4, subject_code),
                credits = COALESCE($5, credits),
                notes = COALESCE($6, notes)
          WHERE id = $1
          RETURNING id, semester_id AS "semesterId", subject_name AS "subjectName", subject_code AS "subjectCode", credits, notes`,
        [id, data.semesterId, data.subjectName?.trim(), data.subjectCode?.trim(), data.credits, data.notes ?? null]
      );

      if (!rowCount) return false;
      return rows[0];
    } catch (error) {
      if (duplicate(error)) return null;
      throw error;
    }
  }

  return withFileStore((store) => {
    const subject = store.subjects.find((s) => s.id === id);
    if (!subject) return false;

    const nextSemesterId = data.semesterId ?? subject.semesterId;
    const nextName = data.subjectName ? data.subjectName.trim() : subject.subjectName;
    const nextCode = data.subjectCode ? data.subjectCode.trim() : subject.subjectCode;
    const nextCredits = data.credits ?? subject.credits;

    if (!store.semesters.some((s) => s.id === nextSemesterId)) throw new Error('FK_SEMESTER');
    if (store.subjects.some((s) => s.id !== id && s.semesterId === nextSemesterId && s.subjectCode.toLowerCase() === nextCode.toLowerCase())) {
      return null;
    }

    subject.semesterId = nextSemesterId;
    subject.subjectName = nextName;
    subject.subjectCode = nextCode;
    subject.credits = nextCredits;
    subject.notes = data.notes === undefined ? subject.notes : data.notes;

    return subject;
  });
}

export async function deleteSubject(id) {
  if (env.dataMode === 'postgres') {
    const { rowCount } = await query('DELETE FROM subjects WHERE id = $1', [id]);
    return rowCount > 0;
  }

  return withFileStore((store) => {
    const before = store.subjects.length;
    store.subjectPrerequisites = store.subjectPrerequisites.filter((p) => p.subjectId !== id && p.prerequisiteSubjectId !== id);
    store.subjects = store.subjects.filter((s) => s.id !== id);
    return before !== store.subjects.length;
  });
}
