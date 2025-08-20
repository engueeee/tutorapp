import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { tutorComment } = await request.json();

    if (!tutorComment || typeof tutorComment !== "string") {
      return NextResponse.json(
        { error: "Comment is required and must be a string" },
        { status: 400 }
      );
    }

    // Update the lesson with the tutor comment
    const updatedLesson = await prisma.lesson.update({
      where: { id },
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Remove the tutor comment from the lesson
    const updatedLesson = await prisma.lesson.update({
      where: { id },
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
      { error: "Failed to remove lesson comment" },
      { status: 500 }
    );
  }
}
