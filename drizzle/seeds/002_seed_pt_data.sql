-- Insert Faculty of Physical Therapy
INSERT INTO faculties (name, code, description, createdAt, updatedAt) VALUES
('Faculty of Physical Therapy', 'PT', 'Comprehensive physical therapy program with 5 years of study', NOW(), NOW());

-- Get the faculty ID (assuming it's the last inserted)
SET @faculty_id = LAST_INSERT_ID();

-- Insert Program
INSERT INTO programs (facultyId, name, code, description, totalYears, createdAt, updatedAt) VALUES
(@faculty_id, 'Bachelor of Physical Therapy', 'BPT', '5-year comprehensive physical therapy program', 5, NOW(), NOW());

SET @program_id = LAST_INSERT_ID();

-- Insert Years
INSERT INTO years (programId, yearNumber, name, createdAt, updatedAt) VALUES
(@program_id, 1, 'Year 1', NOW(), NOW()),
(@program_id, 2, 'Year 2', NOW(), NOW()),
(@program_id, 3, 'Year 3', NOW(), NOW()),
(@program_id, 4, 'Year 4', NOW(), NOW()),
(@program_id, 5, 'Year 5', NOW(), NOW());

-- Store year IDs in variables
SET @year1_id = LAST_INSERT_ID();
SET @year2_id = @year1_id + 1;
SET @year3_id = @year1_id + 2;
SET @year4_id = @year1_id + 3;
SET @year5_id = @year1_id + 4;

-- Insert Semesters
INSERT INTO semesters (yearId, semesterNumber, name, createdAt, updatedAt) VALUES
(@year1_id, 1, 'Semester 1', NOW(), NOW()),
(@year1_id, 2, 'Semester 2', NOW(), NOW()),
(@year2_id, 3, 'Semester 3', NOW(), NOW()),
(@year2_id, 4, 'Semester 4', NOW(), NOW()),
(@year3_id, 5, 'Semester 5', NOW(), NOW()),
(@year3_id, 6, 'Semester 6', NOW(), NOW()),
(@year4_id, 7, 'Semester 7', NOW(), NOW()),
(@year4_id, 8, 'Semester 8', NOW(), NOW()),
(@year5_id, 9, 'Semester 9', NOW(), NOW()),
(@year5_id, 10, 'Semester 10', NOW(), NOW());

-- Store semester IDs
SET @sem1_id = LAST_INSERT_ID();
SET @sem2_id = @sem1_id + 1;
SET @sem3_id = @sem1_id + 2;
SET @sem4_id = @sem1_id + 3;
SET @sem5_id = @sem1_id + 4;
SET @sem6_id = @sem1_id + 5;
SET @sem7_id = @sem1_id + 6;
SET @sem8_id = @sem1_id + 7;
SET @sem9_id = @sem1_id + 8;
SET @sem10_id = @sem1_id + 9;

-- Insert Courses for Semester 1
INSERT INTO courses (semesterId, code, name, credits, description, createdAt, updatedAt) VALUES
(@sem1_id, 'PHY112', 'Biophysics (for Physiotherapy)', 3, NULL, NOW(), NOW()),
(@sem1_id, 'BPT111', 'Ethics and Laws', 1, NULL, NOW(), NOW()),
(@sem1_id, 'BMS115', 'Anatomy 1 (for physiotherapy)', 3, NULL, NOW(), NOW()),
(@sem1_id, 'BMS124', 'Histology 1 (for physiotherapy)', 2, NULL, NOW(), NOW()),
(@sem1_id, 'BMS136', 'Physiology 1 (for physiotherapy)', 3, NULL, NOW(), NOW()),
(@sem1_id, 'BMS149', 'Biochemistry (for physiotherapy)', 4, NULL, NOW(), NOW()),
(@sem1_id, 'UC1', 'University Requirement (1)', 2, NULL, NOW(), NOW());

-- Insert Courses for Semester 2
INSERT INTO courses (semesterId, code, name, credits, description, createdAt, updatedAt) VALUES
(@sem2_id, 'BPT112', 'Kinesiology 1', 3, NULL, NOW(), NOW()),
(@sem2_id, 'BPT113', 'Tests and Measurements 1', 3, NULL, NOW(), NOW()),
(@sem2_id, 'BMS116', 'Anatomy 2 (for physiotherapy)', 3, NULL, NOW(), NOW()),
(@sem2_id, 'BMS125', 'Histology 2 (for physiotherapy)', 2, NULL, NOW(), NOW()),
(@sem2_id, 'BMS137', 'Physiology 2 (for physiotherapy)', 3, NULL, NOW(), NOW()),
(@sem2_id, 'UC2', 'University Requirement (2)', 2, NULL, NOW(), NOW()),
(@sem2_id, 'UC3', 'University Requirement (3)', 2, NULL, NOW(), NOW());

-- Insert Courses for Semester 3
INSERT INTO courses (semesterId, code, name, credits, description, createdAt, updatedAt) VALUES
(@sem3_id, 'BPT214', 'Kinesiology 2', 3, NULL, NOW(), NOW()),
(@sem3_id, 'BPT215', 'Tests and Measurements 2', 3, NULL, NOW(), NOW()),
(@sem3_id, 'PTH241', 'Growth and Development and Human Genetics', 2, NULL, NOW(), NOW()),
(@sem3_id, 'BMS211', 'Neuroanatomy (for physiotherapy)', 3, NULL, NOW(), NOW()),
(@sem3_id, 'BMS234', 'Neurophysiology 1 (for physiotherapy)', 3, NULL, NOW(), NOW()),
(@sem3_id, 'BMS244', 'Clinical Biochemistry (for physiotherapy)', 4, NULL, NOW(), NOW());

-- Insert Courses for Semester 4
INSERT INTO courses (semesterId, code, name, credits, description, createdAt, updatedAt) VALUES
(@sem4_id, 'BPT216', 'Biomechanics 1', 3, NULL, NOW(), NOW()),
(@sem4_id, 'BPT217', 'Therapeutic Modalities', 6, NULL, NOW(), NOW()),
(@sem4_id, 'BPT218', 'Exercise Physiology', 2, NULL, NOW(), NOW()),
(@sem4_id, 'BMS212', 'Anatomy 3 (for physiotherapy)', 3, NULL, NOW(), NOW()),
(@sem4_id, 'BMS235', 'Neurophysiology 2 (for physiotherapy)', 3, NULL, NOW(), NOW()),
(@sem4_id, 'UC4', 'University Requirement (4)', 2, NULL, NOW(), NOW());

-- Insert Courses for Semester 5
INSERT INTO courses (semesterId, code, name, credits, description, createdAt, updatedAt) VALUES
(@sem5_id, 'BPT319', 'Biomechanics 2', 3, NULL, NOW(), NOW()),
(@sem5_id, 'BMS352', 'Pathology 1 (for physiotherapy)', 3, NULL, NOW(), NOW()),
(@sem5_id, 'BMS361', 'Pharmacology 1 (for physiotherapy)', 2, NULL, NOW(), NOW()),
(@sem5_id, 'CMS313', 'Theory of Internal Medicine (for physiotherapy)', 8, NULL, NOW(), NOW()),
(@sem5_id, 'CMS321', 'Cardiothoracic Surgery (for physiotherapy)', 1, NULL, NOW(), NOW()),
(@sem5_id, 'CMS322', 'Radiology 1 (for physiotherapy)', 2, NULL, NOW(), NOW()),
(@sem5_id, 'E1', 'Elective Course (1)', 3, NULL, NOW(), NOW());

-- Insert Courses for Semester 6
INSERT INTO courses (semesterId, code, name, credits, description, createdAt, updatedAt) VALUES
(@sem6_id, 'PTM322', 'Cardiopulmonary and Internal Medicine PT and Rehabilitation', 8, NULL, NOW(), NOW()),
(@sem6_id, 'BMS353', 'Pathology 2 (for physiotherapy)', 3, NULL, NOW(), NOW()),
(@sem6_id, 'BMS362', 'Pharmacology 2 (for physiotherapy)', 2, NULL, NOW(), NOW()),
(@sem6_id, 'CMS323', 'General Surgery (for physiotherapy)', 3, NULL, NOW(), NOW()),
(@sem6_id, 'CMS342', 'Obstetrics & Gynaecology (for physiotherapy)', 2, NULL, NOW(), NOW()),
(@sem6_id, 'CMS383', 'Public Health (for physiotherapy)', 2, NULL, NOW(), NOW()),
(@sem6_id, 'E2', 'Elective Course (2)', 2, NULL, NOW(), NOW());

-- Insert Courses for Semester 7
INSERT INTO courses (semesterId, code, name, credits, description, createdAt, updatedAt) VALUES
(@sem7_id, 'PTM423', 'Integumentary PT and Rehabilitation', 5, NULL, NOW(), NOW()),
(@sem7_id, 'PTH442', 'Woman Health PT and Rehabilitation', 4, NULL, NOW(), NOW()),
(@sem7_id, 'CMS423', 'Radiology 2 (for physiotherapy)', 2, NULL, NOW(), NOW()),
(@sem7_id, 'CMS424', 'Traumatology and Orthopaedic Surgery', 4, NULL, NOW(), NOW()),
(@sem7_id, 'UC5', 'University Requirement (5)', 2, NULL, NOW(), NOW()),
(@sem7_id, 'UC6', 'University Requirement (6)', 2, NULL, NOW(), NOW()),
(@sem7_id, 'UE1', 'Elective University Requirement (1)', 2, NULL, NOW(), NOW());

-- Insert Courses for Semester 8
INSERT INTO courses (semesterId, code, name, credits, description, createdAt, updatedAt) VALUES
(@sem8_id, 'PTO431', 'Sport injuries PT and Rehabilitation', 7, NULL, NOW(), NOW()),
(@sem8_id, 'PTO432', 'Orthopaedics PT and Rehabilitation', 7, NULL, NOW(), NOW()),
(@sem8_id, 'CMS426', 'Paediatric Surgery (for physiotherapy)', 1, NULL, NOW(), NOW()),
(@sem8_id, 'CMS433', 'Paediatrics (for physiotherapy)', 2, NULL, NOW(), NOW()),
(@sem8_id, 'E3', 'Elective Course (3)', 2, NULL, NOW(), NOW()),
(@sem8_id, 'PTO433', 'Orthoses and Prostheses', 2, NULL, NOW(), NOW());

-- Insert Courses for Semester 9
INSERT INTO courses (semesterId, code, name, credits, description, createdAt, updatedAt) VALUES
(@sem9_id, 'PTH543', 'Paediatrics PT and Rehabilitation', 8, NULL, NOW(), NOW()),
(@sem9_id, 'BMS431', 'Electro-diagnosis (for physiotherapy)', 2, NULL, NOW(), NOW()),
(@sem9_id, 'CMS512', 'Neuropsychiatry (for physiotherapy)', 4, NULL, NOW(), NOW()),
(@sem9_id, 'CMS522', 'Neurosurgery (for physiotherapy)', 1, NULL, NOW(), NOW()),
(@sem9_id, 'CMS523', 'Radiology 3 (for physiotherapy)', 2, NULL, NOW(), NOW()),
(@sem9_id, 'E4', 'Elective Course (4)', 1, NULL, NOW(), NOW()),
(@sem9_id, 'UC7', 'University Requirement (7)', 2, NULL, NOW(), NOW()),
(@sem9_id, 'UE2', 'Elective University (2)', 2, NULL, NOW(), NOW());

-- Insert Courses for Semester 10
INSERT INTO courses (semesterId, code, name, credits, description, createdAt, updatedAt) VALUES
(@sem10_id, 'PTN552', 'Neurology PT and Rehabilitation', 7, NULL, NOW(), NOW()),
(@sem10_id, 'PTN553', 'Neurosurgery PT and Rehabilitation', 4, NULL, NOW(), NOW()),
(@sem10_id, 'CMS502', 'Differential Diagnosis 1 (for physiotherapy)', 2, NULL, NOW(), NOW()),
(@sem10_id, 'E5', 'Elective Course (5)', 2, NULL, NOW(), NOW()),
(@sem10_id, 'UE3', 'Elective University (3)', 2, NULL, NOW(), NOW()),
(@sem10_id, 'BPT514', 'Graduation Research Project', 2, NULL, NOW(), NOW());
