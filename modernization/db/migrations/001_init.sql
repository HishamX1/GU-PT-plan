BEGIN;

CREATE TABLE IF NOT EXISTS colleges (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS programs (
  id BIGSERIAL PRIMARY KEY,
  college_id BIGINT NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (college_id, name)
);

CREATE TABLE IF NOT EXISTS years (
  id BIGSERIAL PRIMARY KEY,
  program_id BIGINT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  year_number SMALLINT NOT NULL CHECK (year_number >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (program_id, year_number)
);

CREATE TABLE IF NOT EXISTS semesters (
  id BIGSERIAL PRIMARY KEY,
  year_id BIGINT NOT NULL REFERENCES years(id) ON DELETE CASCADE,
  semester_number SMALLINT NOT NULL CHECK (semester_number IN (1, 2)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (year_id, semester_number)
);

CREATE TABLE IF NOT EXISTS subjects (
  id BIGSERIAL PRIMARY KEY,
  semester_id BIGINT NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  subject_code TEXT NOT NULL,
  credits SMALLINT NOT NULL CHECK (credits > 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (semester_id, subject_code)
);

CREATE TABLE IF NOT EXISTS subject_prerequisites (
  subject_id BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  prerequisite_subject_id BIGINT NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (subject_id, prerequisite_subject_id),
  CHECK (subject_id <> prerequisite_subject_id)
);

CREATE INDEX IF NOT EXISTS idx_programs_college_id ON programs (college_id);
CREATE INDEX IF NOT EXISTS idx_years_program_id ON years (program_id);
CREATE INDEX IF NOT EXISTS idx_semesters_year_id ON semesters (year_id);
CREATE INDEX IF NOT EXISTS idx_subjects_semester_id ON subjects (semester_id);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON subjects (subject_code);

COMMIT;
