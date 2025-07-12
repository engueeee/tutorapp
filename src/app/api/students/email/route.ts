import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  console.log("Students email API called with:", { email });

  if (!email) {
    return NextResponse.json(
      { error: "Missing email parameter" },
      { status: 400 }
    );
  }

  try {
    const students = await prisma.student.findMany({
      where: { email } as any,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        age: true,
        contact: true,
        grade: true,
        email: true,
        phoneNumber: true,
        profilePhoto: true,
        onboardingCompleted: true,
        createdAt: true,
      } as any,
      orderBy: { createdAt: "desc" },
    });

    console.log("Found students by email:", students);
    return NextResponse.json(students);
  } catch (err) {
    console.error("[API/STUDENTS/EMAIL][GET]", err);
    return NextResponse.json(
      { error: "Failed to fetch students by email" },
      { status: 500 }
    );
  }
}
