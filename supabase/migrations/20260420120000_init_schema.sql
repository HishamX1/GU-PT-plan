BEGIN;

CREATE TABLE IF NOT EXISTS public.colleges (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.programs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  college_id bigint NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT programs_college_name_key UNIQUE (college_id, name)
);

CREATE TABLE IF NOT EXISTS public.years (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  program_id bigint NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  year_number smallint NOT NULL CHECK (year_number >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT years_program_year_key UNIQUE (program_id, year_number)
);

CREATE TABLE IF NOT EXISTS public.semesters (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  year_id bigint NOT NULL REFERENCES public.years(id) ON DELETE CASCADE,
  semester_number smallint NOT NULL CHECK (semester_number IN (1, 2)),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT semesters_year_semester_key UNIQUE (year_id, semester_number)
);

CREATE TABLE IF NOT EXISTS public.subjects (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  semester_id bigint NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
  subject_name text NOT NULL,
  subject_code text NOT NULL,
  credits smallint NOT NULL CHECK (credits > 0),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subjects_semester_code_key UNIQUE (semester_id, subject_code)
);

CREATE TABLE IF NOT EXISTS public.subject_prerequisites (
  subject_id bigint NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  prerequisite_subject_id bigint NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subject_prerequisites_pkey PRIMARY KEY (subject_id, prerequisite_subject_id),
  CONSTRAINT subject_prerequisites_no_self CHECK (subject_id <> prerequisite_subject_id)
);

CREATE INDEX IF NOT EXISTS idx_programs_college_id ON public.programs (college_id);
CREATE INDEX IF NOT EXISTS idx_years_program_id ON public.years (program_id);
CREATE INDEX IF NOT EXISTS idx_semesters_year_id ON public.semesters (year_id);
CREATE INDEX IF NOT EXISTS idx_subjects_semester_id ON public.subjects (semester_id);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON public.subjects (subject_code);

ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_prerequisites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS colleges_all_access ON public.colleges;
CREATE POLICY colleges_all_access ON public.colleges
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS programs_all_access ON public.programs;
CREATE POLICY programs_all_access ON public.programs
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS years_all_access ON public.years;
CREATE POLICY years_all_access ON public.years
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS semesters_all_access ON public.semesters;
CREATE POLICY semesters_all_access ON public.semesters
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS subjects_all_access ON public.subjects;
CREATE POLICY subjects_all_access ON public.subjects
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS subject_prerequisites_all_access ON public.subject_prerequisites;
CREATE POLICY subject_prerequisites_all_access ON public.subject_prerequisites
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

COMMIT;
