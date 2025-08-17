import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is a student - only students should create student records
    if (user.role !== "student") {
      return NextResponse.json(
        { error: "Only students can create student records" },
        { status: 403 }
      );
    }

    // Check if student already exists for this user
    const existingStudent = await prisma.student.findFirst({
      where: { userId: userId },
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: "Student already exists for this user" },
        { status: 409 }
      );
    }

    // Create new student record
    const student = await prisma.student.create({
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        tutorId: user.id, // Self-registered users become their own tutor
        userId: userId,
        onboardingCompleted: false,
      },
    });

    return NextResponse.json({ student }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}
