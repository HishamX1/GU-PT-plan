const mysql = require("mysql2/promise");
const { drizzle } = require("drizzle-orm/mysql2");
const { faculties, programs, years, semesters, courses, coursePrerequisites } = require("./drizzle/schema.ts");

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
];

async function seedData() {
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    const db = drizzle(connection);

    console.log("Starting data migration...");
    console.log("This is a placeholder. Use pnpm db:seed or manual SQL insertion.");

    process.exit(0);
  } catch (error) {
    console.error("Error during data migration:", error);
    process.exit(1);
  }
}

seedData();
