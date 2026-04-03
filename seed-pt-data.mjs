import { drizzle } from "drizzle-orm/mysql2";
import { faculties, programs, years, semesters, courses, coursePrerequisites } from "./drizzle/schema.ts";
import mysql from "mysql2/promise";

// Physical Therapy course data
const ptCourses = [
  // Semester 1
  { code: "PHY112", name: "Biophysics (for Physiotherapy)", semester: 1, prerequisites: [], credits: 3 },
  { code: "BPT111", name: "Ethics and Laws", semester: 1, prerequisites: [], credits: 1 },
  { code: "BMS115", name: "Anatomy 1 (for physiotherapy)", semester: 1, prerequisites: [], credits: 3 },
  { code: "BMS124", name: "Histology 1 (for physiotherapy)", semester: 1, prerequisites: [], credits: 2 },
  { code: "BMS136", name: "Physiology 1 (for physiotherapy)", semester: 1, prerequisites: [], credits: 3 },
  { code: "BMS149", name: "Biochemistry (for physiotherapy)", semester: 1, prerequisites: [], credits: 4 },
  { code: "UC1", name: "University Requirement (1)", semester: 1, prerequisites: [], credits: 2 },

  // Semester 2
  { code: "BPT112", name: "Kinesiology 1", semester: 2, prerequisites: ["BMS115"], credits: 3 },
  { code: "BPT113", name: "Tests and Measurements 1", semester: 2, prerequisites: ["BMS115"], credits: 3 },
  { code: "BMS116", name: "Anatomy 2 (for physiotherapy)", semester: 2, prerequisites: ["BMS115"], credits: 3 },
  { code: "BMS125", name: "Histology 2 (for physiotherapy)", semester: 2, prerequisites: ["BMS124"], credits: 2 },
  { code: "BMS137", name: "Physiology 2 (for physiotherapy)", semester: 2, prerequisites: ["BMS136"], credits: 3 },
  { code: "UC2", name: "University Requirement (2)", semester: 2, prerequisites: [], credits: 2 },
  { code: "UC3", name: "University Requirement (3)", semester: 2, prerequisites: [], credits: 2 },

  // Semester 3
  { code: "BPT214", name: "Kinesiology 2", semester: 3, prerequisites: ["BMS115", "BMS116", "BPT112"], credits: 3 },
  { code: "BPT215", name: "Tests and Measurements 2", semester: 3, prerequisites: ["BPT113", "BMS115", "BMS116"], credits: 3 },
  { code: "PTH241", name: "Growth and Development and Human Genetics", semester: 3, prerequisites: [], credits: 2 },
  { code: "BMS211", name: "Neuroanatomy (for physiotherapy)", semester: 3, prerequisites: [], credits: 3 },
  { code: "BMS234", name: "Neurophysiology 1 (for physiotherapy)", semester: 3, prerequisites: [], credits: 3 },
  { code: "BMS244", name: "Clinical Biochemistry (for physiotherapy)", semester: 3, prerequisites: ["BMS149"], credits: 4 },

  // Semester 4
  { code: "BPT216", name: "Biomechanics 1", semester: 4, prerequisites: ["BMS115", "BMS116", "BPT112", "BPT214"], credits: 3 },
  { code: "BPT217", name: "Therapeutic Modalities", semester: 4, prerequisites: ["PHY112", "BMS115", "BMS116", "BPT113", "BPT215"], credits: 6 },
  { code: "BPT218", name: "Exercise Physiology", semester: 4, prerequisites: ["BMS136", "BMS137"], credits: 2 },
  { code: "BMS212", name: "Anatomy 3 (for physiotherapy)", semester: 4, prerequisites: ["BMS115", "BMS116"], credits: 3 },
  { code: "BMS235", name: "Neurophysiology 2 (for physiotherapy)", semester: 4, prerequisites: ["BMS234"], credits: 3 },
  { code: "UC4", name: "University Requirement (4)", semester: 4, prerequisites: [], credits: 2 },

  // Semester 5
  { code: "BPT319", name: "Biomechanics 2", semester: 5, prerequisites: ["BPT216", "BMS115", "BMS116", "BPT112", "BPT214"], credits: 3 },
  { code: "BMS352", name: "Pathology 1 (for physiotherapy)", semester: 5, prerequisites: ["BMS212", "BMS124", "BMS125", "BMS136", "BMS137"], credits: 3 },
  { code: "BMS361", name: "Pharmacology 1 (for physiotherapy)", semester: 5, prerequisites: ["BMS136", "BMS137", "BMS234", "BMS235"], credits: 2 },
  { code: "CMS313", name: "Theory of Internal Medicine (for physiotherapy)", semester: 5, prerequisites: ["BMS136", "BMS137", "BMS115", "BMS116", "BMS212"], credits: 8 },
  { code: "CMS321", name: "Cardiothoracic Surgery (for physiotherapy)", semester: 5, prerequisites: ["BMS115", "BMS116", "BMS212", "BMS136", "BMS137"], credits: 1 },
  { code: "CMS322", name: "Radiology 1 (for physiotherapy)", semester: 5, prerequisites: ["BMS115", "BMS116", "BMS212"], credits: 2 },
  { code: "E1", name: "Elective Course (1)", semester: 5, prerequisites: [], credits: 3 },

  // Semester 6
  { code: "PTM322", name: "Cardiopulmonary and Internal Medicine PT and Rehabilitation", semester: 6, prerequisites: ["CMS322", "CMS321", "BPT217", "PHY112", "BMS115", "BMS116", "BPT113", "BPT215", "BPT218", "BMS136", "BMS137", "BMS212", "BMS124", "BMS125", "CMS313"], credits: 8 },
  { code: "BMS353", name: "Pathology 2 (for physiotherapy)", semester: 6, prerequisites: ["BMS212", "BMS124", "BMS125", "BMS136", "BMS137", "BMS352"], credits: 3 },
  { code: "BMS362", name: "Pharmacology 2 (for physiotherapy)", semester: 6, prerequisites: ["BMS361"], credits: 2 },
  { code: "CMS323", name: "General Surgery (for physiotherapy)", semester: 6, prerequisites: ["BMS136", "BMS137", "BMS115", "BMS116", "BMS212", "BMS124", "BMS125"], credits: 3 },
  { code: "CMS342", name: "Obstetrics & Gynaecology (for physiotherapy)", semester: 6, prerequisites: ["BMS136", "BMS137", "BMS115", "BMS116", "BMS212"], credits: 2 },
  { code: "CMS383", name: "Public Health (for physiotherapy)", semester: 6, prerequisites: [], credits: 2 },
  { code: "E2", name: "Elective Course (2)", semester: 6, prerequisites: [], credits: 2 },

  // Semester 7
  { code: "PTM423", name: "Integumentary PT and Rehabilitation", semester: 7, prerequisites: ["CMS313", "BMS212", "BMS124", "BMS125", "BPT217", "BMS136", "BMS137", "CMS323"], credits: 5 },
  { code: "PTH442", name: "Woman Health PT and Rehabilitation", semester: 7, prerequisites: ["BMS136", "BMS137", "BMS115", "BMS116", "BMS212", "CMS342", "BPT217", "PHY112", "BPT113", "BPT215"], credits: 4 },
  { code: "CMS423", name: "Radiology 2 (for physiotherapy)", semester: 7, prerequisites: ["BMS115", "BMS116", "CMS322"], credits: 2 },
  { code: "CMS424", name: "Traumatology and Orthopaedic Surgery", semester: 7, prerequisites: ["BPT216", "BMS115", "BMS116", "BPT112", "BPT214", "BPT319"], credits: 4 },
  { code: "UC5", name: "University Requirement (5)", semester: 7, prerequisites: [], credits: 2 },
  { code: "UC6", name: "University Requirement (6)", semester: 7, prerequisites: [], credits: 2 },
  { code: "UE1", name: "Elective University Requirement (1)", semester: 7, prerequisites: [], credits: 2 },

  // Semester 8
  { code: "PTO431", name: "Sport injuries PT and Rehabilitation", semester: 8, prerequisites: ["BPT217", "PHY112", "BMS115", "BMS116", "BPT113", "BPT215", "CMS424", "BMS212", "CMS423", "CMS322"], credits: 7 },
  { code: "PTO432", name: "Orthopaedics PT and Rehabilitation", semester: 8, prerequisites: ["BPT217", "PHY112", "BMS115", "BMS116", "BPT113", "BPT215", "CMS424", "CMS322", "CMS423", "BMS212"], credits: 7 },
  { code: "CMS426", name: "Paediatric Surgery (for physiotherapy)", semester: 8, prerequisites: ["BMS115", "BMS116", "BMS211", "PTH241"], credits: 1 },
  { code: "CMS433", name: "Paediatrics (for physiotherapy)", semester: 8, prerequisites: ["BMS115", "BMS116", "BMS211", "PTH241"], credits: 2 },
  { code: "E3", name: "Elective Course (3)", semester: 8, prerequisites: [], credits: 2 },
  { code: "PTO433", name: "Orthoses and Prostheses", semester: 8, prerequisites: ["CMS424", "CMS423", "BMS115", "BMS116", "BMS212"], credits: 2 },

  // Semester 9
  { code: "PTH543", name: "Paediatrics PT and Rehabilitation", semester: 9, prerequisites: ["PTH241", "BPT217", "PHY112", "BMS115", "BMS116", "BPT113", "BPT215", "CMS433", "CMS426"], credits: 8 },
  { code: "BMS431", name: "Electro-diagnosis (for physiotherapy)", semester: 9, prerequisites: ["BMS234", "BMS235", "BMS115", "BMS116"], credits: 2 },
  { code: "CMS512", name: "Neuropsychiatry (for physiotherapy)", semester: 9, prerequisites: ["BMS211", "BMS234", "BMS235", "BMS361", "BMS362"], credits: 4 },
  { code: "CMS522", name: "Neurosurgery (for physiotherapy)", semester: 9, prerequisites: ["BMS211", "BMS234", "BMS235"], credits: 1 },
  { code: "CMS523", name: "Radiology 3 (for physiotherapy)", semester: 9, prerequisites: ["BMS211", "BMS234", "BMS235", "CMS423"], credits: 2 },
  { code: "E4", name: "Elective Course (4)", semester: 9, prerequisites: [], credits: 1 },
  { code: "UC7", name: "University Requirement (7)", semester: 9, prerequisites: [], credits: 2 },
  { code: "UE2", name: "Elective University (2)", semester: 9, prerequisites: [], credits: 2 },

  // Semester 10
  { code: "PTN552", name: "Neurology PT and Rehabilitation", semester: 10, prerequisites: ["BPT217", "PHY112", "BMS115", "BMS116", "BPT113", "BPT215", "BPT218", "BMS136", "BMS137", "BMS211", "BMS234", "BMS235", "BMS361", "BMS362", "CMS512"], credits: 7 },
  { code: "PTN553", name: "Neurosurgery PT and Rehabilitation", semester: 10, prerequisites: ["BMS211", "BMS234", "BMS235", "CMS522", "BPT217", "PHY112", "BMS115", "BMS116", "BPT113", "BPT215"], credits: 4 },
  { code: "CMS502", name: "Differential Diagnosis 1 (for physiotherapy)", semester: 10, prerequisites: ["CMS424", "CMS512", "CMS522", "CMS313", "CMS323"], credits: 2 },
  { code: "E5", name: "Elective Course (5)", semester: 10, prerequisites: [], credits: 2 },
  { code: "UE3", name: "Elective University (3)", semester: 10, prerequisites: [], credits: 2 },
  { code: "BPT514", name: "Graduation Research Project", semester: 10, prerequisites: ["LIB116"], credits: 2 },
];

async function seedData() {
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    const db = drizzle(connection);

    console.log("Starting data migration...");

    // Create Faculty
    const facultyResult = await db.insert(faculties).values({
      name: "Faculty of Physical Therapy",
      code: "PT",
      description: "Comprehensive physical therapy program with 5 years of study",
    });

    const facultyId = facultyResult[0].insertId;
    console.log("Created faculty with ID:", facultyId);

    // Create Program
    const programResult = await db.insert(programs).values({
      facultyId,
      name: "Bachelor of Physical Therapy",
      code: "BPT",
      description: "5-year comprehensive physical therapy program",
      totalYears: 5,
    });

    const programId = programResult[0].insertId;
    console.log("Created program with ID:", programId);

    // Create Years
    const yearIds = {};
    for (let i = 1; i <= 5; i++) {
      const yearResult = await db.insert(years).values({
        programId,
        yearNumber: i,
        name: `Year ${i}`,
      });
      yearIds[i] = yearResult[0].insertId;
      console.log(`Created year ${i} with ID:`, yearIds[i]);
    }

    // Create Semesters
    const semesterIds = {};
    for (let i = 1; i <= 10; i++) {
      const yearNumber = Math.ceil(i / 2);
      const semesterNumber = i % 2 === 0 ? 2 : 1;
      const semesterResult = await db.insert(semesters).values({
        yearId: yearIds[yearNumber],
        semesterNumber: i,
        name: `Semester ${i}`,
      });
      semesterIds[i] = semesterResult[0].insertId;
      console.log(`Created semester ${i} with ID:`, semesterIds[i]);
    }

    // Create Courses and track them by code
    const courseMap = {};
    for (const courseData of ptCourses) {
      const courseResult = await db.insert(courses).values({
        semesterId: semesterIds[courseData.semester],
        code: courseData.code,
        name: courseData.name,
        credits: courseData.credits,
      });
      courseMap[courseData.code] = courseResult[0].insertId;
    }
    console.log("Created all courses");

    // Create Prerequisites
    for (const courseData of ptCourses) {
      if (courseData.prerequisites.length > 0) {
        for (const prereqCode of courseData.prerequisites) {
          const courseId = courseMap[courseData.code];
          const prereqId = courseMap[prereqCode];
          if (courseId && prereqId) {
            await db.insert(coursePrerequisites).values({
              courseId,
              prerequisiteId: prereqId,
            });
          }
        }
      }
    }
    console.log("Created all prerequisites");

    console.log("Data migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error during data migration:", error);
    process.exit(1);
  }
}

seedData();
