import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tutorId = searchParams.get("tutorId");

    if (!tutorId) {
      return NextResponse.json(
        { error: "Tutor ID is required" },
        { status: 400 }
      );
    }

    const lessons = await prisma.lesson.findMany({
      where: { tutorId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            grade: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
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
