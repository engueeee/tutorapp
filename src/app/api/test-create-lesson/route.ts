import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Get the first tutor, course, and student from the database
    const tutor = await prisma.user.findFirst({
      where: { role: "tutor" },
    });

    const course = await prisma.course.findFirst({
      where: { tutorId: tutor?.id },
    });

    const student = await prisma.student.findFirst({
      where: { tutorId: tutor?.id },
    });

    if (!tutor || !course || !student) {
      return NextResponse.json(
        { error: "Missing tutor, course, or student" },
        { status: 400 }
      );
    }

    // Create a test lesson
    const lesson = await prisma.lesson.create({
      data: {
        title: "Test Lesson",
        description: "This is a test lesson",
        date: "2024-01-15",
        startTime: "14:00",
        duration: "60",
        zoomLink: "https://zoom.us/test",
        subject: "Mathematics",
        tutorId: tutor.id,
        courseId: course.id,
        studentId: student.id,
      },
      include: {
        student: true,
        course: true,
        tutor: true,
      },
    });

    return NextResponse.json({
      message: "Test lesson created successfully",
      lesson,
    });
  } catch (error) {
    console.error("Error creating test lesson:", error);
    return NextResponse.json(
      { error: "Failed to create test lesson" },
      { status: 500 }
    );
  }
}
