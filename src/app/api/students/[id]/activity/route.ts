import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = params.id;

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Update the student's lastActivity to current timestamp
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        lastActivity: new Date(),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        lastActivity: true,
      },
    });

    return NextResponse.json(updatedStudent);
  } catch (err) {
    console.error("[API/STUDENTS/ACTIVITY][PUT]", err);
    return NextResponse.json(
      { error: "Failed to update student activity" },
      { status: 500 }
    );
  }
}
