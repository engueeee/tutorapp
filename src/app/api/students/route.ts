// Fichier : /src/app/api/students/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tutorId = searchParams.get("tutorId");
  const userId = searchParams.get("userId");

  if (!tutorId && !userId) {
    return NextResponse.json(
      { error: "Missing tutorId or userId" },
      { status: 400 }
    );
  }

  try {
    let students;

    if (tutorId) {
      // Fetch students by tutor
      students = await prisma.student.findMany({
        where: { tutorId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          age: true,
          email: true,
          grade: true,
          phoneNumber: true,
          profilePhoto: true,
          onboardingCompleted: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Fetch student by user ID
      students = await prisma.student.findMany({
        where: { userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          age: true,
          email: true,
          grade: true,
          phoneNumber: true,
          profilePhoto: true,
          onboardingCompleted: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(students);
  } catch (err) {
    console.error("[API/STUDENTS][GET]", err);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, age, email, grade, tutorId } = body;

    if (
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof tutorId !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid or missing required fields" },
        { status: 400 }
      );
    }

    const newStudent = await prisma.student.create({
      data: {
        firstName,
        lastName,
        age,
        email: email ?? null,
        grade: grade ?? null,
        tutorId,
      },
    });

    return NextResponse.json(newStudent);
  } catch (err) {
    console.error("[API/STUDENTS][POST]", err);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}
