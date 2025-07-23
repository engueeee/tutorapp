import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id },
      include: {
        student: true,
        lessonStudents: {
          include: {
            student: true,
          },
        },
        course: true,
        tutor: true,
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("[API/LESSONS][GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch lesson" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const updatedLesson = await prisma.lesson.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        date: body.date,
        startTime: body.startTime,
        duration: body.duration,
        zoomLink: body.zoomLink,
        subject: body.subject,
        courseId: body.courseId,
        studentId: body.studentId,
      },
      include: {
        student: true,
        lessonStudents: {
          include: {
            student: true,
          },
        },
        course: true,
        tutor: true,
      },
    });

    return NextResponse.json(updatedLesson);
  } catch (error) {
    console.error("[API/LESSONS][PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update lesson" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.lesson.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API/LESSONS][DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}
