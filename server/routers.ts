import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getFaculties,
  getFacultyByCode,
  getProgramsByFacultyId,
  getYearsByProgramId,
  getSemestersByYearId,
  getCoursesBySemesterId,
  getCourseById,
  getPrerequisitesByCourseId,
  getRequiredForByCourseId,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  createProgram,
  updateProgram,
  deleteProgram,
  createYear,
  updateYear,
  deleteYear,
  createSemester,
  updateSemester,
  deleteSemester,
  createCourse,
  updateCourse,
  deleteCourse,
  addCoursePrerequisite,
  removeCoursePrerequisite,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Study plan routes (public)
  studyPlan: router({
    faculties: publicProcedure.query(() => getFaculties()),

    facultyByCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(({ input }) => getFacultyByCode(input.code)),

    programsByFacultyId: publicProcedure
      .input(z.object({ facultyId: z.number() }))
      .query(({ input }) => getProgramsByFacultyId(input.facultyId)),

    yearsByProgramId: publicProcedure
      .input(z.object({ programId: z.number() }))
      .query(({ input }) => getYearsByProgramId(input.programId)),

    semestersByYearId: publicProcedure
      .input(z.object({ yearId: z.number() }))
      .query(({ input }) => getSemestersByYearId(input.yearId)),

    coursesBySemesterId: publicProcedure
      .input(z.object({ semesterId: z.number() }))
      .query(({ input }) => getCoursesBySemesterId(input.semesterId)),

    courseById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const course = await getCourseById(input.id);
        if (!course) return null;
        const prerequisites = await getPrerequisitesByCourseId(input.id);
        const requiredFor = await getRequiredForByCourseId(input.id);
        return { ...course, prerequisites, requiredFor };
      }),
  }),

  // Admin routes (protected)
  admin: router({
    // Faculty management
    createFaculty: protectedProcedure
      .input(z.object({ name: z.string(), code: z.string(), description: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return createFaculty(input);
      }),

    updateFaculty: protectedProcedure
      .input(z.object({ id: z.number(), name: z.string().optional(), code: z.string().optional(), description: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const { id, ...data } = input;
        return updateFaculty(id, data);
      }),

    deleteFaculty: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return deleteFaculty(input.id);
      }),

    // Program management
    createProgram: protectedProcedure
      .input(z.object({ facultyId: z.number(), name: z.string(), code: z.string(), description: z.string().optional(), totalYears: z.number().optional() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return createProgram(input);
      }),

    updateProgram: protectedProcedure
      .input(z.object({ id: z.number(), facultyId: z.number().optional(), name: z.string().optional(), code: z.string().optional(), description: z.string().optional(), totalYears: z.number().optional() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const { id, ...data } = input;
        return updateProgram(id, data);
      }),

    deleteProgram: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return deleteProgram(input.id);
      }),

    // Year management
    createYear: protectedProcedure
      .input(z.object({ programId: z.number(), yearNumber: z.number(), name: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return createYear(input);
      }),

    updateYear: protectedProcedure
      .input(z.object({ id: z.number(), programId: z.number().optional(), yearNumber: z.number().optional(), name: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const { id, ...data } = input;
        return updateYear(id, data);
      }),

    deleteYear: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return deleteYear(input.id);
      }),

    // Semester management
    createSemester: protectedProcedure
      .input(z.object({ yearId: z.number(), semesterNumber: z.number(), name: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return createSemester(input);
      }),

    updateSemester: protectedProcedure
      .input(z.object({ id: z.number(), yearId: z.number().optional(), semesterNumber: z.number().optional(), name: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const { id, ...data } = input;
        return updateSemester(id, data);
      }),

    deleteSemester: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return deleteSemester(input.id);
      }),

    // Course management
    createCourse: protectedProcedure
      .input(z.object({ semesterId: z.number(), code: z.string(), name: z.string(), credits: z.number(), description: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return createCourse(input);
      }),

    updateCourse: protectedProcedure
      .input(z.object({ id: z.number(), semesterId: z.number().optional(), code: z.string().optional(), name: z.string().optional(), credits: z.number().optional(), description: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const { id, ...data } = input;
        return updateCourse(id, data);
      }),

    deleteCourse: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return deleteCourse(input.id);
      }),

    // Course prerequisites management
    addPrerequisite: protectedProcedure
      .input(z.object({ courseId: z.number(), prerequisiteId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return addCoursePrerequisite(input.courseId, input.prerequisiteId);
      }),

    removePrerequisite: protectedProcedure
      .input(z.object({ courseId: z.number(), prerequisiteId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return removeCoursePrerequisite(input.courseId, input.prerequisiteId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
