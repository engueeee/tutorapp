import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateLessonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  duration: z.string().min(1, "Duration is required"),
  zoomLink: z.string().optional().or(z.literal("")),
  subject: z.string().optional(),
  tutorId: z.string().min(1, "Tutor ID is required"),
  courseId: z.string().min(1, "Course ID is required"),
  studentId: z.string().min(1, "Student ID is required"),
});

const UpdateLessonSchema = CreateLessonSchema.partial();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("lessonId");
    const tutorId = searchParams.get("tutorId");
    const courseId = searchParams.get("courseId");
    if (lessonId) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          student: true,
          course: {
            include: {
              courseStudents: { include: { student: true } },
            },
          },
        },
      });
      return NextResponse.json(lesson);
    }
    if (!tutorId && !courseId) {
      return NextResponse.json(
        { error: "tutorId or courseId is required" },
        { status: 400 }
      );
    }
    const where: any = {};
    if (tutorId) where.tutorId = tutorId;
    if (courseId) where.courseId = courseId;
    const lessons = await prisma.lesson.findMany({
      where,
      include: {
        student: true,
        course: {
          include: {
            courseStudents: { include: { student: true } },
          },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
    return NextResponse.json(lessons);
  } catch (err) {
    console.error("[API/LESSONS][GET]", err);
    return NextResponse.json(
      { error: "Failed to load lessons" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validationResult = CreateLessonSchema.safeParse(body);
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
      startTime,
      duration,
      zoomLink,
      subject,
      tutorId,
      courseId,
      studentId,
    } = validationResult.data;
    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        date,
        startTime,
        duration,
        zoomLink,
        subject,
        tutorId,
        courseId,
        studentId,
      },
      include: {
        student: true,
        course: {
          include: {
            courseStudents: { include: { student: true } },
          },
        },
      },
    });
    return NextResponse.json(lesson, { status: 201 });
  } catch (err) {
    console.error("[API/LESSONS][POST]", err);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("lessonId");
    if (!lessonId) {
      return NextResponse.json(
        { error: "Lesson ID is required" },
        { status: 400 }
      );
    }
    await prisma.lesson.delete({ where: { id: lessonId } });
    return NextResponse.json({ message: "Lesson deleted" });
  } catch (err) {
    console.error("[API/LESSONS][DELETE]", err);
    return NextResponse.json(
      { error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("lessonId");
    if (!lessonId) {
      return NextResponse.json(
        { error: "Lesson ID is required" },
        { status: 400 }
      );
    }
    const data = await req.json();
    const validationResult = UpdateLessonSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }
    const updated = await prisma.lesson.update({
      where: { id: lessonId },
      data: validationResult.data,
      include: {
        student: true,
        course: {
          include: {
            courseStudents: { include: { student: true } },
          },
        },
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[API/LESSONS][PATCH]", err);
    return NextResponse.json(
      { error: "Failed to update lesson" },
      { status: 500 }
    );
  }
}
