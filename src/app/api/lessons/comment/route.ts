import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const { lessonId, tutorComment } = await request.json();

    if (!lessonId || !tutorComment || typeof tutorComment !== "string") {
      return NextResponse.json(
        {
          error:
            "lessonId and tutorComment are required and tutorComment must be a string",
        },
        { status: 400 }
      );
    }

    // Update the lesson with the tutor comment
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: { tutorComment },
      include: {
        student: true,
        course: true,
        lessonStudents: {
          include: {
            student: true,
          },
        },
      },
    });

    return NextResponse.json(updatedLesson);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update lesson comment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { lessonId } = await request.json();

    if (!lessonId) {
      return NextResponse.json(
        { error: "lessonId is required" },
        { status: 400 }
      );
    }

    // Remove the tutor comment from the lesson
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: { tutorComment: null },
      include: {
        student: true,
        course: true,
        lessonStudents: {
          include: {
            student: true,
          },
        },
      },
    });

    return NextResponse.json(updatedLesson);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to remove lesson comment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
