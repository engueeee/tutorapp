// Fichier : /src/app/api/courses/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schemas
const CreateCourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  tutorId: z.string().min(1, "Tutor ID is required"),
  studentIds: z.array(z.string()).min(1, "At least one student is required"),
});

const GetCoursesQuerySchema = z.object({
  tutorId: z.string().optional(),
  studentId: z.string().optional(),
  includeStudents: z.boolean().optional().default(true),
  includeLessons: z.boolean().optional().default(false),
});

// GET: fetch all courses for a tutor or student, with students and lessons
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tutorId = searchParams.get("tutorId");
    const studentId = searchParams.get("studentId");
    const courseId = searchParams.get("courseId");
    const includeStudents = searchParams.get("includeStudents") === "true";
    const includeLessons = searchParams.get("includeLessons") === "true";

    console.log("Courses API: Request parameters:");
    console.log("  - tutorId:", tutorId, "(type:", typeof tutorId, ")");
    console.log("  - studentId:", studentId, "(type:", typeof studentId, ")");
    console.log("  - courseId:", courseId, "(type:", typeof courseId, ")");
    console.log("  - includeStudents:", includeStudents);
    console.log("  - includeLessons:", includeLessons);

    // Validate tutorId if provided
    if (
      tutorId !== null &&
      (tutorId.trim() === "" || tutorId === "null" || tutorId === "undefined")
    ) {
      console.error("Courses API: Invalid tutorId provided:", tutorId);
      return NextResponse.json(
        {
          error: "Invalid tutorId provided",
          details: [
            {
              code: "invalid_type",
              expected: "string",
              received: "null",
              path: ["tutorId"],
              message: "Expected string, received null",
            },
          ],
        },
        { status: 400 }
      );
    }

    // Validate studentId if provided
    if (
      studentId !== null &&
      (studentId.trim() === "" ||
        studentId === "null" ||
        studentId === "undefined")
    ) {
      console.error("Courses API: Invalid studentId provided:", studentId);
      return NextResponse.json(
        {
          error: "Invalid studentId provided",
          details: [
            {
              code: "invalid_type",
              expected: "string",
              received: "null",
              path: ["studentId"],
              message: "Expected string, received null",
            },
          ],
        },
        { status: 400 }
      );
    }

    const whereClause: any = {};

    if (tutorId) {
      whereClause.tutorId = tutorId;
    }

    if (courseId) {
      whereClause.id = courseId;
    }

    if (studentId) {
      console.log(
        "Courses API: Looking for courses with studentId:",
        studentId
      );

      // First, let's check if the student exists
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { courseStudents: { include: { course: true } } },
      });

      console.log("Courses API: Student found:", student ? "Yes" : "No");
      if (student) {
        console.log(
          "Courses API: Student courseStudents count:",
          student.courseStudents.length
        );
        console.log(
          "Courses API: Student courseStudents:",
          student.courseStudents.map((cs) => ({
            courseId: cs.courseId,
            courseTitle: cs.course.title,
          }))
        );
      }

      whereClause.courseStudents = {
        some: {
          studentId: studentId,
        },
      };
    }

    // Ensure at least one filter is provided
    if (!tutorId && !studentId) {
      console.error("Courses API: No tutorId or studentId provided");
      return NextResponse.json(
        { error: "Either tutorId or studentId is required" },
        { status: 400 }
      );
    }

    console.log("Courses API: Final where clause:", whereClause);

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        tutor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lessons: includeLessons
          ? {
              include: {
                student: true,
                lessonStudents: {
                  include: {
                    student: true,
                  },
                },
              } as any,
            }
          : false,
        courseStudents: includeStudents
          ? { include: { student: true } }
          : false,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("Courses API: Found courses count:", courses.length);
    console.log(
      "Courses API: First course (if any):",
      courses[0] || "No courses found"
    );

    // Transform the data to match frontend expectations
    const transformedCourses = courses.map((course: any) => {
      const transformedCourse = {
        ...course,
        // Transform courseStudents to students array
        students: course.courseStudents
          ? course.courseStudents.map((cs: any) => cs.student)
          : [],
        // Keep courseStudents for backward compatibility
        courseStudents: course.courseStudents || [],
      };

      // Remove courseStudents from the main object to avoid confusion
      delete (transformedCourse as any).courseStudents;

      return transformedCourse;
    });

    return NextResponse.json(transformedCourses);
  } catch (err) {
    console.error("[API/COURSES][GET]", err);
    return NextResponse.json(
      { error: "Failed to load courses" },
      { status: 500 }
    );
  }
}

// POST: create a course and assign students
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
    const { title, description, tutorId, studentIds } = validationResult.data;
    // Create course first
    const course = await prisma.course.create({
      data: {
        title,
        description,
        tutorId,
      },
      include: {
        lessons: true,
        courseStudents: { include: { student: true } },
      },
    });
    // Create CourseStudent join records
    await prisma.courseStudent.createMany({
      data: studentIds.map((studentId: string) => ({
        courseId: course.id,
        studentId,
      })),
    });
    // Refetch course with students
    const courseWithStudents = await prisma.course.findUnique({
      where: { id: course.id },
      include: {
        lessons: true,
        courseStudents: { include: { student: true } },
      },
    });

    if (!courseWithStudents) {
      return NextResponse.json(
        { error: "Failed to fetch created course" },
        { status: 500 }
      );
    }

    // Transform the data to match frontend expectations
    const transformedCourse = {
      ...courseWithStudents,
      // Transform courseStudents to students array
      students: courseWithStudents.courseStudents
        ? courseWithStudents.courseStudents.map((cs: any) => cs.student)
        : [],
    };

    // Remove courseStudents from the main object to avoid confusion
    delete (transformedCourse as any).courseStudents;

    return NextResponse.json(transformedCourse, { status: 201 });
  } catch (err) {
    console.error("[API/COURSES][POST]", err);
    return NextResponse.json(
      { error: "Failed to create course" },
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

    // Use transaction to delete course and all related lessons and course-student links
    await prisma.$transaction(async (tx) => {
      // Delete lessons first (due to foreign key constraints)
      await tx.lesson.deleteMany({
        where: { courseId },
      });

      // Delete course-student links
      await tx.courseStudent.deleteMany({
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
    // Return the error message for easier frontend debugging
    return NextResponse.json(
      {
        error: "Failed to delete course",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

// PATCH: update course details or link students to an existing course
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { courseId, studentIds, tutorId, title, description } = body;

    if (!courseId || !tutorId) {
      return NextResponse.json(
        { error: "courseId and tutorId are required" },
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

    // If updating course details
    if (title !== undefined || description !== undefined) {
      const updatedCourse = await prisma.course.update({
        where: { id: courseId },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
        },
        include: {
          lessons: true,
          courseStudents: { include: { student: true } },
        },
      });

      // Transform the data to match frontend expectations
      const transformedCourse = {
        ...updatedCourse,
        // Transform courseStudents to students array
        students: updatedCourse.courseStudents
          ? updatedCourse.courseStudents.map((cs: any) => cs.student)
          : [],
      };

      // Remove courseStudents from the main object to avoid confusion
      delete (transformedCourse as any).courseStudents;

      return NextResponse.json(transformedCourse);
    }

    // If linking students to course
    if (studentIds && Array.isArray(studentIds)) {
      // Verify all students exist and belong to the tutor
      const students = await prisma.student.findMany({
        where: {
          id: { in: studentIds },
          tutorId: tutorId,
        },
      });

      if (students.length !== studentIds.length) {
        return NextResponse.json(
          { error: "Some students not found or don't belong to this tutor" },
          { status: 400 }
        );
      }

      // Create CourseStudent join records
      await prisma.courseStudent.createMany({
        data: studentIds.map((studentId: string) => ({
          courseId: courseId,
          studentId,
        })),
        skipDuplicates: true, // Skip if already linked
      });

      // Refetch course with updated students
      const updatedCourse = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          lessons: true,
          courseStudents: { include: { student: true } },
        },
      });

      // Transform the data to match frontend expectations
      const transformedCourse = {
        ...updatedCourse,
        // Transform courseStudents to students array
        students: updatedCourse?.courseStudents
          ? updatedCourse.courseStudents.map((cs: any) => cs.student)
          : [],
      };

      // Remove courseStudents from the main object to avoid confusion
      delete (transformedCourse as any).courseStudents;

      return NextResponse.json(transformedCourse);
    }

    return NextResponse.json(
      { error: "No valid update data provided" },
      { status: 400 }
    );
  } catch (err) {
    console.error("[API/COURSES][PATCH]", err);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}
