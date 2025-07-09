import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, firstName, lastName, email } = body;

    console.log("Creating student for user:", {
      userId,
      firstName,
      lastName,
      email,
    });

    if (!userId || !email) {
      return NextResponse.json(
        { error: "userId and email are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log("User not found:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("User found:", user);

    // Check if student already exists for this user
    const existingStudent = await prisma.student.findFirst({
      where: { userId } as any,
    });

    if (existingStudent) {
      console.log("Student already exists:", existingStudent);
      return NextResponse.json(
        {
          error: "Student already exists for this user",
          studentId: existingStudent.id,
        },
        { status: 409 }
      );
    }

    console.log("Creating new student record...");

    // Create student record
    const student = await prisma.student.create({
      data: {
        firstName: firstName || user.firstName || "",
        lastName: lastName || user.lastName || "",
        email: email,
        userId: userId,
      } as any,
    });

    console.log("Student created successfully:", student);

    return NextResponse.json({
      message: "Student record created successfully",
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: (student as any).email,
      },
    });
  } catch (error) {
    console.error(
      "[API/STUDENTS/CREATE-FOR-USER][POST] Detailed error:",
      error
    );
    return NextResponse.json(
      {
        error: "Failed to create student record",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
