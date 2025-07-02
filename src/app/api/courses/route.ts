// Fichier : /src/app/api/courses/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      date,
      duration,
      zoomLink,
      tutorId,
      studentIds,
      subject,
      startTime,
    } = body;

    if (
      !title ||
      !date ||
      !duration ||
      !tutorId ||
      !startTime ||
      !Array.isArray(studentIds)
    ) {
      return NextResponse.json(
        { error: "Champs requis manquants" },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        createdAt: new Date(date),
        tutorId,
      },
    });

    const lessons = await Promise.all(
      studentIds.map((studentId: string) =>
        prisma.lesson.create({
          data: {
            date,
            duration,
            startTime,
            zoomLink,
            subject,
            tutorId,
            studentId,
          },
        })
      )
    );

    return NextResponse.json({ course, lessons }, { status: 201 });
  } catch (err) {
    console.error("[API/COURSE][POST]", err);
    return NextResponse.json(
      { error: "Erreur lors de la création du cours et des leçons" },
      { status: 500 }
    );
  }
}
