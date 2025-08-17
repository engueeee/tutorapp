import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection by fetching a lesson
    const lessons = await prisma.lesson.findMany({
      take: 1,
      select: {
        id: true,
        title: true,
        tutorComment: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Database connection working",
      lessonCount: lessons.length,
      sampleLesson: lessons[0] || null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { lessonId, tutorComment } = await request.json();

    if (!lessonId || !tutorComment) {
      return NextResponse.json(
        { error: "lessonId and tutorComment are required" },
        { status: 400 }
      );
    }

    // Test updating a lesson comment
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: { tutorComment },
      select: {
        id: true,
        title: true,
        tutorComment: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Comment updated successfully",
      lesson: updatedLesson,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update comment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
