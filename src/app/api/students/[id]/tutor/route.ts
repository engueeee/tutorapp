import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = params.id;

    console.log("Tutor API: Fetching tutor for studentId:", studentId);

    if (!studentId || studentId.trim() === "") {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Find the student and include tutor information
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        tutor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!student) {
      console.log("Tutor API: Student not found:", studentId);
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    console.log("Tutor API: Student found:", {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      tutorId: student.tutorId,
      hasTutor: !!student.tutor,
    });

    if (!student.tutor) {
      console.log("Tutor API: No tutor assigned to student");
      return NextResponse.json(
        { error: "No tutor assigned to this student" },
        { status: 404 }
      );
    }

    console.log("Tutor API: Returning tutor info:", {
      id: student.tutor.id,
      firstName: student.tutor.firstName,
      lastName: student.tutor.lastName,
      email: student.tutor.email,
    });

    return NextResponse.json({
      tutor: student.tutor,
    });
  } catch (err) {
    console.error("[API/STUDENTS/TUTOR][GET]", err);
    return NextResponse.json(
      { error: "Failed to fetch tutor information" },
      { status: 500 }
    );
  }
}
