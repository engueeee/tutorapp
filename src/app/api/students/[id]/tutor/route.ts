import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const studentId = String(id);

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        tutor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            profilePhoto: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (!student.tutor) {
      return NextResponse.json(
        { error: "No tutor assigned to this student" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      tutor: student.tutor,
      studentId: student.id,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch tutor information" },
      { status: 500 }
    );
  }
}
