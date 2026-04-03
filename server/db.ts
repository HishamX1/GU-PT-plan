import { eq, and, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, faculties, InsertFaculty, programs, InsertProgram, years, InsertYear, semesters, InsertSemester, courses, InsertCourse, coursePrerequisites, InsertCoursePrerequisite } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Faculty queries
export async function getFaculties() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(faculties);
}

export async function getFacultyByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(faculties).where(eq(faculties.code, code)).limit(1);
  return result[0];
}

// Program queries
export async function getProgramsByFacultyId(facultyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(programs).where(eq(programs.facultyId, facultyId));
}

export async function getProgramById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(programs).where(eq(programs.id, id)).limit(1);
  return result[0];
}

// Year queries
export async function getYearsByProgramId(programId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(years).where(eq(years.programId, programId)).orderBy(years.yearNumber);
}

export async function getYearById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(years).where(eq(years.id, id)).limit(1);
  return result[0];
}

// Semester queries
export async function getSemestersByYearId(yearId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(semesters).where(eq(semesters.yearId, yearId)).orderBy(semesters.semesterNumber);
}

export async function getSemesterById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(semesters).where(eq(semesters.id, id)).limit(1);
  return result[0];
}

// Course queries
export async function getCoursesBySemesterId(semesterId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses).where(eq(courses.semesterId, semesterId));
}

export async function getCourseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return result[0];
}

export async function getCourseByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(courses).where(eq(courses.code, code)).limit(1);
  return result[0];
}

// Course Prerequisites queries
export async function getPrerequisitesByCourseId(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select()
    .from(coursePrerequisites)
    .where(eq(coursePrerequisites.courseId, courseId));
  
  // Fetch the actual prerequisite course objects
  const prereqIds = result.map(r => r.prerequisiteId);
  if (prereqIds.length === 0) return [];
  
  return db.select().from(courses).where(inArray(courses.id, prereqIds));
}

export async function getRequiredForByCourseId(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select()
    .from(coursePrerequisites)
    .where(eq(coursePrerequisites.prerequisiteId, courseId));
  
  // Fetch the actual course objects that require this prerequisite
  const courseIds = result.map(r => r.courseId);
  if (courseIds.length === 0) return [];
  
  return db.select().from(courses).where(inArray(courses.id, courseIds));
}

// Admin mutations
export async function createFaculty(faculty: InsertFaculty) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(faculties).values(faculty);
  return result;
}

export async function updateFaculty(id: number, faculty: Partial<InsertFaculty>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(faculties).set(faculty).where(eq(faculties.id, id));
}

export async function deleteFaculty(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(faculties).where(eq(faculties.id, id));
}

export async function createProgram(program: InsertProgram) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(programs).values(program);
}

export async function updateProgram(id: number, program: Partial<InsertProgram>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(programs).set(program).where(eq(programs.id, id));
}

export async function deleteProgram(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(programs).where(eq(programs.id, id));
}

export async function createYear(year: InsertYear) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(years).values(year);
}

export async function updateYear(id: number, year: Partial<InsertYear>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(years).set(year).where(eq(years.id, id));
}

export async function deleteYear(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(years).where(eq(years.id, id));
}

export async function createSemester(semester: InsertSemester) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(semesters).values(semester);
}

export async function updateSemester(id: number, semester: Partial<InsertSemester>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(semesters).set(semester).where(eq(semesters.id, id));
}

export async function deleteSemester(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(semesters).where(eq(semesters.id, id));
}

export async function createCourse(course: InsertCourse) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(courses).values(course);
}

export async function updateCourse(id: number, course: Partial<InsertCourse>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(courses).set(course).where(eq(courses.id, id));
}

export async function deleteCourse(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(courses).where(eq(courses.id, id));
}

export async function addCoursePrerequisite(courseId: number, prerequisiteId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(coursePrerequisites).values({ courseId, prerequisiteId });
}

export async function removeCoursePrerequisite(courseId: number, prerequisiteId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .delete(coursePrerequisites)
    .where(
      and(
        eq(coursePrerequisites.courseId, courseId),
        eq(coursePrerequisites.prerequisiteId, prerequisiteId)
      )
    );
}
