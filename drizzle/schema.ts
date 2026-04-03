import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Faculty table
export const faculties = mysqlTable("faculties", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Faculty = typeof faculties.$inferSelect;
export type InsertFaculty = typeof faculties.$inferInsert;

// Program table
export const programs = mysqlTable("programs", {
  id: int("id").autoincrement().primaryKey(),
  facultyId: int("facultyId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  description: text("description"),
  totalYears: int("totalYears").default(5).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Program = typeof programs.$inferSelect;
export type InsertProgram = typeof programs.$inferInsert;

// Year table
export const years = mysqlTable("years", {
  id: int("id").autoincrement().primaryKey(),
  programId: int("programId").notNull(),
  yearNumber: int("yearNumber").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Year = typeof years.$inferSelect;
export type InsertYear = typeof years.$inferInsert;

// Semester table
export const semesters = mysqlTable("semesters", {
  id: int("id").autoincrement().primaryKey(),
  yearId: int("yearId").notNull(),
  semesterNumber: int("semesterNumber").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Semester = typeof semesters.$inferSelect;
export type InsertSemester = typeof semesters.$inferInsert;

// Course table
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  semesterId: int("semesterId").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  credits: int("credits").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

// Course Prerequisites table (many-to-many relationship)
export const coursePrerequisites = mysqlTable("coursePrerequisites", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  prerequisiteId: int("prerequisiteId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CoursePrerequisite = typeof coursePrerequisites.$inferSelect;
export type InsertCoursePrerequisite = typeof coursePrerequisites.$inferInsert;