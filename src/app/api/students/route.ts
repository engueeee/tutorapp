// Fichier : /src/app/api/students/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tutorId = searchParams.get("tutorId");

  if (!tutorId) {
    return NextResponse.json({ error: "Missing tutorId" }, { status: 400 });
  }

  try {
    const students = await prisma.student.findMany({
      where: { tutorId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        age: true,
        contact: true,
        grade: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

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
    console.log("body", body);
    const { firstName, lastName, age, contact, grade, tutorId } = body;

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
        contact: contact ?? null,
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
