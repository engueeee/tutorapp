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

    // Validate tutorId if provided
    if (tutorId !== null && tutorId !== undefined && tutorId.trim() === "") {
      return NextResponse.json(
        {
          error: "Invalid tutorId provided",
          details: [
            {
              code: "invalid_type",
              expected: "string",
              received: typeof tutorId,
              path: ["tutorId"],
              message: `Expected string, received ${typeof tutorId}: ${tutorId}`,
            },
          ],
        },
        { status: 400 }
      );
    }

    // Validate studentId if provided
    if (
      studentId !== null &&
      studentId !== undefined &&
      (studentId.trim() === "" ||
        studentId === "null" ||
        studentId === "undefined")
    ) {
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

    if (!tutorId && !courseId && !studentId) {
      return NextResponse.json(
        { error: "Either tutorId, courseId, or studentId is required" },
        { status: 400 }
      );
    }

    let courses: any[] = [];

    if (tutorId) {
      // Try a very basic query first
      try {
        courses = await prisma.course.findMany({
          where: {
            tutorId: String(tutorId).trim(),
          },
          include: {
            tutor: true,
          },
          orderBy: { createdAt: "desc" },
        });

        // If includeLessons is true, fetch lessons separately
        if (includeLessons && courses.length > 0) {
          const courseIds = courses.map((c) => c.id);
          const lessons = await prisma.lesson.findMany({
            where: {
              courseId: { in: courseIds },
            },
            include: {
              student: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              lessonStudents: {
                include: {
                  student: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                    },
                  },
                },
              },
            },
          });

          // Attach lessons to courses
          courses = courses.map((course) => ({
            ...course,
            lessons: lessons.filter((lesson) => lesson.courseId === course.id),
          }));
        }

        // If includeStudents is true, fetch students separately
        if (includeStudents && courses.length > 0) {
          const courseIds = courses.map((c) => c.id);
          const courseStudents = await prisma.courseStudent.findMany({
            where: {
              courseId: { in: courseIds },
            },
            include: {
              student: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  age: true,
                  contact: true,
                  grade: true,
                  phoneNumber: true,
                  profilePhoto: true,
                  lastActivity: true,
                  onboardingCompleted: true,
                  hourlyRate: true,
                  createdAt: true,
                  tutorId: true,
                  userId: true,
                },
              },
            },
          });

          // Attach students to courses
          courses = courses.map((course) => ({
            ...course,
            courseStudents: courseStudents.filter(
              (cs) => cs.courseId === course.id
            ),
          }));
        }
      } catch (error) {
        courses = [];
      }
    } else if (courseId) {
      const course = await prisma.course.findUnique({
        where: {
          id: courseId,
        },
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
                },
              }
            : false,
          courseStudents: includeStudents
            ? { include: { student: true } }
            : false,
        },
      });
      courses = course ? [course] : [];
    } else if (studentId) {
      // For studentId, we need to get courses through courseStudents
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          courseStudents: {
            include: {
              course: {
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
                        },
                      }
                    : false,
                },
              },
            },
          },
        },
      });

      if (student) {
        courses = student.courseStudents.map((cs) => cs.course);
      }
    }

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
      {
        error: "Failed to load courses",
        details: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      },
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
