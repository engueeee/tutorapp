// Fichier : /src/app/api/courses/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schemas
const CreateCourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  duration: z.string().min(1, "Duration is required"),
  zoomLink: z.string().optional().or(z.literal("")),
  tutorId: z.string().min(1, "Tutor ID is required"),
  studentIds: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? val : val ? [val] : []))
    .refine((val) => val.length > 0, "At least one student is required"),
  subject: z.string().min(1, "Subject is required"),
  startTime: z.string().min(1, "Start time is required"),
});

const GetCoursesQuerySchema = z.object({
  tutorId: z.string().min(1, "Tutor ID is required"),
  includeStudents: z.boolean().optional().default(true),
  includeLessons: z.boolean().optional().default(false),
});

// 🔍 GET : récupérer tous les cours avec les leçons et étudiants
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Debug: Log the request details
    console.log("[API/COURSES][GET] Request URL:", req.url);
    console.log(
      "[API/COURSES][GET] Search params:",
      Object.fromEntries(searchParams.entries())
    );
    console.log("[API/COURSES][GET] Referer:", req.headers.get("referer"));
    console.log(
      "[API/COURSES][GET] User-Agent:",
      req.headers.get("user-agent")
    );

    // Validate query parameters
    const queryResult = GetCoursesQuerySchema.safeParse({
      tutorId: searchParams.get("tutorId"),
      includeStudents: searchParams.get("includeStudents") === "true",
      includeLessons: searchParams.get("includeLessons") === "true",
    });

    if (!queryResult.success) {
      console.log(
        "[API/COURSES][GET] Validation failed:",
        queryResult.error.errors
      );
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: queryResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { tutorId, includeStudents, includeLessons } = queryResult.data;

    // Build the include object dynamically
    const include: any = {};
    if (includeLessons) {
      include.lessons = {
        include: includeStudents ? { student: true } : false,
      };
    }

    const courses = await prisma.course.findMany({
      where: { tutorId },
      include,
      orderBy: { createdAt: "desc" },
    });

    // If we need students but didn't include lessons, fetch them separately
    let formatted: any[] = courses;
    if (includeStudents && !includeLessons) {
      formatted = await Promise.all(
        courses.map(async (course) => {
          const lessons = await prisma.lesson.findMany({
            where: { courseId: course.id },
            include: { student: true },
          });

          // Remove duplicates based on student ID
          const uniqueStudents = lessons
            .map((lesson) => lesson.student)
            .filter(
              (student, index, self) =>
                index === self.findIndex((s) => s.id === student.id)
            );

          return {
            ...course,
            students: uniqueStudents,
            studentCount: uniqueStudents.length,
            status: "Active", // This could be calculated based on lessons dates
          };
        })
      );
    } else if (includeLessons && includeStudents) {
      // Format courses with lessons and students
      formatted = courses.map((course) => ({
        ...course,
        studentCount: course.lessons?.length || 0,
        status: "Active",
      }));
    } else {
      // Just add basic info
      formatted = courses.map((course) => ({
        ...course,
        studentCount: 0,
        status: "Active",
      }));
    }

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("[API/COURSES][GET]", err);
    return NextResponse.json(
      { error: "Failed to load courses" },
      { status: 500 }
    );
  }
}

// 📝 POST : création d'un cours + leçons pour chaque élève
export async function POST(req: NextRequest) {
  try {
    console.log("[API/COURSES][POST] Request received");
    const body = await req.json();
    console.log("[API/COURSES][POST] Request body:", body);

    // Validate request body
    const validationResult = CreateCourseSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      date,
      duration,
      zoomLink,
      tutorId,
      studentIds,
      subject,
      startTime,
    } = validationResult.data;

    // Verify tutor exists
    const tutor = await prisma.user.findUnique({
      where: { id: tutorId, role: "tutor" },
    });

    if (!tutor) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    // Verify all students exist and belong to the tutor
    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        tutorId,
      },
    });

    if (students.length !== studentIds.length) {
      return NextResponse.json(
        { error: "Some students not found or don't belong to this tutor" },
        { status: 400 }
      );
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create course
      const course = await tx.course.create({
        data: {
          title,
          description,
          tutorId,
        },
      });

      // Create lessons for each student
      const lessons = await Promise.all(
        studentIds.map((studentId) =>
          tx.lesson.create({
            data: {
              date,
              duration,
              startTime,
              zoomLink: zoomLink || null,
              subject,
              tutorId,
              studentId,
              courseId: course.id,
              title,
              description,
            },
          })
        )
      );

      return { course, lessons };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("[API/COURSES][POST]", err);

    // Handle specific Prisma errors
    if (err instanceof Error) {
      if (err.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "Course with this title already exists for this tutor" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create course and lessons" },
      { status: 500 }
    );
  }
}

// 🗑️ DELETE : supprimer un cours et ses leçons
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const tutorId = searchParams.get("tutorId");

    if (!courseId || !tutorId) {
      return NextResponse.json(
        { error: "Course ID and Tutor ID are required" },
        { status: 400 }
      );
    }

    // Verify course exists and belongs to tutor
    const course = await prisma.course.findFirst({
      where: { id: courseId, tutorId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found or access denied" },
        { status: 404 }
      );
    }

    // Use transaction to delete course and all related lessons
    await prisma.$transaction(async (tx) => {
      // Delete lessons first (due to foreign key constraints)
      await tx.lesson.deleteMany({
        where: { courseId },
      });

      // Delete course
      await tx.course.delete({
        where: { id: courseId },
      });
    });

    return NextResponse.json(
      { message: "Course and related lessons deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("[API/COURSES][DELETE]", err);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
