BEGIN;

INSERT INTO colleges(name) VALUES ('Galala University') ON CONFLICT(name) DO NOTHING;

INSERT INTO programs(college_id, name)
SELECT c.id, 'Physical Therapy Program' FROM colleges c WHERE c.name='Galala University'
ON CONFLICT (college_id, name) DO NOTHING;

INSERT INTO years(program_id, year_number)
SELECT p.id, 1 FROM programs p JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program'
ON CONFLICT (program_id, year_number) DO NOTHING;

INSERT INTO semesters(year_id, semester_number)
SELECT y.id, 1 FROM years y
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=1
ON CONFLICT (year_id, semester_number) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Anatomy 1 (for physiotherapy)', 'BMS115', 3, NULL
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=1 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Histology 1 (for physiotherapy)', 'BMS124', 2, NULL
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=1 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Physiology 1 (for physiotherapy)', 'BMS136', 3, NULL
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=1 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Biochemistry (for physiotherapy)', 'BMS149', 4, NULL
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=1 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Ethics and Laws', 'BPT111', 1, NULL
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=1 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Biophysics (for Physiotherapy)', 'PHY112', 3, NULL
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=1 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'University Requirement (1)', 'UC1', 2, NULL
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=1 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO semesters(year_id, semester_number)
SELECT y.id, 2 FROM years y
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=1
ON CONFLICT (year_id, semester_number) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Anatomy 2 (for physiotherapy)', 'BMS116', 3, 'Prerequisites: BMS115'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=1 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Histology 2 (for physiotherapy)', 'BMS125', 2, 'Prerequisites: BMS124'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=1 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Physiology 2 (for physiotherapy)', 'BMS137', 3, 'Prerequisites: BMS136'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=1 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Kinesiology 1', 'BPT112', 3, 'Prerequisites: BMS115'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=1 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Tests and Measurements 1', 'BPT113', 3, 'Prerequisites: BMS115'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=1 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'University Requirement (2)', 'UC2', 2, NULL
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=1 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'University Requirement (3)', 'UC3', 2, NULL
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=1 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO years(program_id, year_number)
SELECT p.id, 2 FROM programs p JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program'
ON CONFLICT (program_id, year_number) DO NOTHING;

INSERT INTO semesters(year_id, semester_number)
SELECT y.id, 1 FROM years y
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=2
ON CONFLICT (year_id, semester_number) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Neuroanatomy (for physiotherapy)', 'BMS211', 3, NULL
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=2 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Neurophysiology 1 (for physiotherapy)', 'BMS234', 3, NULL
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=2 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Clinical Biochemistry (for physiotherapy)', 'BMS244', 4, 'Prerequisites: BMS149'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=2 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Kinesiology 2', 'BPT214', 3, 'Prerequisites: BMS115, BMS116, BPT112'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=2 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Tests and Measurements 2', 'BPT215', 3, 'Prerequisites: BPT113, BMS115, BMS116'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=2 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Growth and Development and Human Genetics', 'PTH241', 2, NULL
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=2 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO semesters(year_id, semester_number)
SELECT y.id, 2 FROM years y
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=2
ON CONFLICT (year_id, semester_number) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Anatomy 3 (for physiotherapy)', 'BMS212', 3, 'Prerequisites: BMS115, BMS116'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=2 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Neurophysiology 2 (for physiotherapy)', 'BMS235', 3, 'Prerequisites: BMS234'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=2 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Biomechanics 1', 'BPT216', 3, 'Prerequisites: BMS115, BMS116, BPT112, BPT214'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=2 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Therapeutic Modalities', 'BPT217', 6, 'Prerequisites: PHY112, BMS115, BMS116, BPT113, BPT215'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=2 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Exercise Physiology', 'BPT218', 2, 'Prerequisites: BMS136, BMS137'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=2 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'University Requirement (4)', 'UC4', 2, NULL
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=2 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO years(program_id, year_number)
SELECT p.id, 3 FROM programs p JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program'
ON CONFLICT (program_id, year_number) DO NOTHING;

INSERT INTO semesters(year_id, semester_number)
SELECT y.id, 1 FROM years y
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=3
ON CONFLICT (year_id, semester_number) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Pathology 1 (for physiotherapy)', 'BMS352', 3, 'Prerequisites: BMS212, BMS124, BMS125, BMS136, BMS137'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=3 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Pharmacology 1 (for physiotherapy)', 'BMS361', 2, 'Prerequisites: BMS136, BMS137, BMS234, BMS235'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=3 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Biomechanics 2', 'BPT319', 3, 'Prerequisites: BPT216, BMS115, BMS116, BPT112, BPT214'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=3 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Theory of Internal Medicine (for physiotherapy)', 'CMS313', 8, 'Prerequisites: BMS136, BMS137, BMS115, BMS116, BMS212'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=3 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Cardiothoracic Surgery (for physiotherapy)', 'CMS321', 1, 'Prerequisites: BMS115, BMS116, BMS212, BMS136, BMS137'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=3 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Radiology 1 (for physiotherapy)', 'CMS322', 2, 'Prerequisites: BMS115, BMS116, BMS212'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=3 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Elective Course (1)', 'E1', 3, NULL
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=3 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO semesters(year_id, semester_number)
SELECT y.id, 2 FROM years y
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=3
ON CONFLICT (year_id, semester_number) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Pathology 2 (for physiotherapy)', 'BMS353', 3, 'Prerequisites: BMS212, BMS124, BMS125, BMS136, BMS137, BMS352'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=3 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Pharmacology 2 (for physiotherapy)', 'BMS362', 2, 'Prerequisites: BMS361'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=3 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'General Surgery (for physiotherapy)', 'CMS323', 3, 'Prerequisites: BMS136, BMS137, BMS115, BMS116, BMS212, BMS124, BMS125'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=3 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Obstetrics & Gynaecology (for physiotherapy)', 'CMS342', 2, 'Prerequisites: BMS136, BMS137, BMS115, BMS116, BMS212'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=3 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Public Health (for physiotherapy)', 'CMS383', 2, NULL
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=3 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Elective Course (2)', 'E2', 2, NULL
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=3 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Cardiopulmonary and Internal Medicine PT and Rehabilitation', 'PTM322', 8, 'Prerequisites: CMS322, CMS321, BPT217, PHY112, BMS115, BMS116, BPT113, BPT215, BPT218, BMS136, BMS137, BMS212, BMS124, BMS125, CMS313'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=3 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO years(program_id, year_number)
SELECT p.id, 4 FROM programs p JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program'
ON CONFLICT (program_id, year_number) DO NOTHING;

INSERT INTO semesters(year_id, semester_number)
SELECT y.id, 1 FROM years y
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=4
ON CONFLICT (year_id, semester_number) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Radiology 2 (for physiotherapy)', 'CMS423', 2, 'Prerequisites: BMS115, BMS116, CMS322'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=4 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Traumatology and Orthopaedic Surgery', 'CMS424', 4, 'Prerequisites: BPT216, BMS115, BMS116, BPT112, BPT214, BPT319'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=4 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Woman Health PT and Rehabilitation', 'PTH442', 4, 'Prerequisites: BMS136, BMS137, BMS115, BMS116, BMS212, CMS342, BPT217, PHY112, BPT113, BPT215'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=4 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Integumentary PT and Rehabilitation', 'PTM423', 5, 'Prerequisites: CMS313, BMS212, BMS124, BMS125, BPT217, BMS136, BMS137, CMS323'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=4 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'University Requirement (5)', 'UC5', 2, NULL
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=4 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'University Requirement (6)', 'UC6', 2, NULL
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=4 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Elective University Requirement (1)', 'UE1', 2, NULL
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=4 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO semesters(year_id, semester_number)
SELECT y.id, 2 FROM years y
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=4
ON CONFLICT (year_id, semester_number) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Paediatric Surgery (for physiotherapy)', 'CMS426', 1, 'Prerequisites: BMS115, BMS116, BMS211, PTH241'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=4 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Paediatrics (for physiotherapy)', 'CMS433', 2, 'Prerequisites: BMS115, BMS116, BMS211, PTH241'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=4 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Elective Course (3)', 'E3', 2, NULL
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=4 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Sport injuries PT and Rehabilitation', 'PTO431', 7, 'Prerequisites: BPT217, PHY112, BMS115, BMS116, BPT113, BPT215, CMS424, BMS212, CMS423, CMS322'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=4 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Orthopaedics PT and Rehabilitation', 'PTO432', 7, 'Prerequisites: BPT217, PHY112, BMS115, BMS116, BPT113, BPT215, CMS424, CMS322, CMS423, BMS212'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=4 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Orthoses and Prostheses', 'PTO433', 2, 'Prerequisites: CMS424, CMS423, BMS115, BMS116, BMS212'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=4 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO years(program_id, year_number)
SELECT p.id, 5 FROM programs p JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program'
ON CONFLICT (program_id, year_number) DO NOTHING;

INSERT INTO semesters(year_id, semester_number)
SELECT y.id, 1 FROM years y
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=5
ON CONFLICT (year_id, semester_number) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Electro-diagnosis (for physiotherapy)', 'BMS431', 2, 'Prerequisites: BMS234, BMS235, BMS115, BMS116'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=5 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Neuropsychiatry (for physiotherapy)', 'CMS512', 4, 'Prerequisites: BMS211, BMS234, BMS235, BMS361, BMS362'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=5 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Neurosurgery (for physiotherapy)', 'CMS522', 1, 'Prerequisites: BMS211, BMS234, BMS235'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=5 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Radiology 3 (for physiotherapy)', 'CMS523', 2, 'Prerequisites: BMS211, BMS234, BMS235, CMS423'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=5 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Elective Course (4)', 'E4', 1, NULL
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=5 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Paediatrics PT and Rehabilitation', 'PTH543', 8, 'Prerequisites: PTH241, BPT217, PHY112, BMS115, BMS116, BPT113, BPT215, CMS433, CMS426'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=5 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'University Requirement (7)', 'UC7', 2, NULL
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=5 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Elective University (2)', 'UE2', 2, NULL
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=5 AND s.semester_number=1
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO semesters(year_id, semester_number)
SELECT y.id, 2 FROM years y
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=5
ON CONFLICT (year_id, semester_number) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Graduation Research Project', 'BPT514', 2, 'Prerequisites: LIB116 | Missing in source dataset: LIB116'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=5 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Differential Diagnosis 1 (for physiotherapy)', 'CMS502', 2, 'Prerequisites: CMS424, CMS512, CMS522, CMS313, CMS323'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=5 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Elective Course (5)', 'E5', 2, NULL
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=5 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Neurology PT and Rehabilitation', 'PTN552', 7, 'Prerequisites: BPT217, PHY112, BMS115, BMS116, BPT113, BPT215, BPT218, BMS136, BMS137, BMS211, BMS234, BMS235, BMS361, BMS362, CMS512'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=5 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Neurosurgery PT and Rehabilitation', 'PTN553', 4, 'Prerequisites: BMS211, BMS234, BMS235, CMS522, BPT217, PHY112, BMS115, BMS116, BPT113, BPT215'
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=5 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

INSERT INTO subjects(semester_id, subject_name, subject_code, credits, notes)
SELECT s.id, 'Elective University (3)', 'UE3', 2, NULL
FROM semesters s JOIN years y ON y.id=s.year_id
JOIN programs p ON p.id=y.program_id JOIN colleges c ON c.id=p.college_id
WHERE c.name='Galala University' AND p.name='Physical Therapy Program' AND y.year_number=5 AND s.semester_number=2
ON CONFLICT (semester_id, subject_code) DO NOTHING;

COMMIT;
