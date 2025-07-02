import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-utils";

export interface CreateCourseData {
  title: string;
  description?: string;
  date: string;
  duration: string;
  zoomLink?: string;
  tutorId: string;
  studentIds: string[];
  subject: string;
  startTime: string;
}

export interface CourseWithStudents {
  id: string;
  title: string;
  description?: string | null;
  createdAt: Date;
  students: Array<{
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    contact: string;
    grade: string;
  }>;
  studentCount: number;
  status: string;
}

export class CourseService {
  static async getCoursesByTutor(
    tutorId: string,
    options: {
      includeStudents?: boolean;
      includeLessons?: boolean;
    } = {}
  ): Promise<CourseWithStudents[]> {
    const { includeStudents = true, includeLessons = false } = options;

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
    if (includeStudents && !includeLessons) {
      return await Promise.all(
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
            status: "Active",
          };
        })
      );
    }

    // Format courses with basic info
    return courses.map((course) => ({
      ...course,
      students:
        includeLessons && includeStudents && course.lessons
          ? course.lessons.map((lesson: any) => lesson.student)
          : [],
      studentCount:
        includeLessons && course.lessons ? course.lessons.length : 0,
      status: "Active",
    }));
  }

  static async createCourse(data: CreateCourseData) {
    // Verify tutor exists
    const tutor = await prisma.user.findUnique({
      where: { id: data.tutorId, role: "tutor" },
    });

    if (!tutor) {
      throw new ApiError(404, "Tutor not found");
    }

    // Verify all students exist and belong to the tutor
    const students = await prisma.student.findMany({
      where: {
        id: { in: data.studentIds },
        tutorId: data.tutorId,
      },
    });

    if (students.length !== data.studentIds.length) {
      throw new ApiError(
        400,
        "Some students not found or don't belong to this tutor"
      );
    }

    // Use transaction to ensure data consistency
    return await prisma.$transaction(async (tx) => {
      // Create course
      const course = await tx.course.create({
        data: {
          title: data.title,
          description: data.description,
          tutorId: data.tutorId,
        },
      });

      // Create lessons for each student
      const lessons = await Promise.all(
        data.studentIds.map((studentId) =>
          tx.lesson.create({
            data: {
              date: data.date,
              duration: data.duration,
              startTime: data.startTime,
              zoomLink: data.zoomLink || null,
              subject: data.subject,
              tutorId: data.tutorId,
              studentId,
              courseId: course.id,
              title: data.title,
              description: data.description,
            },
          })
        )
      );

      return { course, lessons };
    });
  }

  static async deleteCourse(courseId: string, tutorId: string) {
    // Verify course exists and belongs to tutor
    const course = await prisma.course.findFirst({
      where: { id: courseId, tutorId },
    });

    if (!course) {
      throw new ApiError(404, "Course not found or access denied");
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

    return { message: "Course and related lessons deleted successfully" };
  }

  static async getCourseById(courseId: string, tutorId: string) {
    const course = await prisma.course.findFirst({
      where: { id: courseId, tutorId },
      include: {
        lessons: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!course) {
      throw new ApiError(404, "Course not found");
    }

    return course;
  }

  static async updateCourse(
    courseId: string,
    tutorId: string,
    data: Partial<{
      title: string;
      description: string;
    }>
  ) {
    // Verify course exists and belongs to tutor
    const course = await prisma.course.findFirst({
      where: { id: courseId, tutorId },
    });

    if (!course) {
      throw new ApiError(404, "Course not found or access denied");
    }

    return await prisma.course.update({
      where: { id: courseId },
      data,
    });
  }
}
