import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseISO, startOfDay, endOfDay, format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tutorId = searchParams.get("tutorId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const studentId = searchParams.get("studentId");

    if (!tutorId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Paramètres manquants: tutorId, startDate, endDate" },
        { status: 400 }
      );
    }

    // Convertir les dates en format string pour la comparaison
    const startDateStr = format(startOfDay(parseISO(startDate)), "yyyy-MM-dd");
    const endDateStr = format(endOfDay(parseISO(endDate)), "yyyy-MM-dd");

    // Construire la condition where pour les leçons
    const whereCondition: any = {
      tutorId: tutorId,
      date: {
        gte: startDateStr,
        lte: endDateStr,
      },
    };

    // Ajouter le filtre étudiant si spécifié
    if (studentId && studentId !== "all") {
      whereCondition.OR = [
        // Ancien système avec un seul étudiant
        { studentId: studentId },
        // Nouveau système avec lessonStudents
        {
          lessonStudents: {
            some: {
              studentId: studentId,
            },
          },
        },
      ];
    }

    // Récupérer les leçons avec les détails des étudiants et cours
    const lessons = await prisma.lesson.findMany({
      where: whereCondition,
      include: {
        course: true,
        lessonStudents: {
          include: {
            student: true,
          },
        },
        student: true, // Pour la compatibilité avec l'ancien système
      },
      orderBy: {
        date: "asc",
      },
    });

    // Calculer les revenus et formater les données
    let totalRevenue = 0;
    const formattedLessons = [];

    for (const lesson of lessons) {
      let lessonRevenue = 0;
      const students = [];

      // Si le système utilise lessonStudents (nouveau système)
      if (lesson.lessonStudents && lesson.lessonStudents.length > 0) {
        for (const lessonStudent of lesson.lessonStudents) {
          const student = lessonStudent.student;

          // Si un étudiant spécifique est filtré, ne traiter que cet étudiant
          if (studentId && studentId !== "all" && student.id !== studentId) {
            continue;
          }

          const hourlyRate = Number(student.hourlyRate) || 30; // Taux par défaut

          // Calculer la durée en heures
          const durationInHours = parseDurationToHours(lesson.duration);
          const studentContribution = hourlyRate * durationInHours;

          students.push({
            firstName: student.firstName,
            lastName: student.lastName,
            hourlyRate: hourlyRate,
            contribution: studentContribution,
          });

          lessonRevenue += studentContribution;
        }
      } else if (lesson.student) {
        // Ancien système avec un seul étudiant
        // Si un étudiant spécifique est filtré, vérifier que c'est le bon étudiant
        if (
          studentId &&
          studentId !== "all" &&
          lesson.student.id !== studentId
        ) {
          continue;
        }

        const hourlyRate = Number(lesson.student.hourlyRate) || 30;
        const durationInHours = parseDurationToHours(lesson.duration);
        const studentContribution = hourlyRate * durationInHours;

        students.push({
          firstName: lesson.student.firstName,
          lastName: lesson.student.lastName,
          hourlyRate: hourlyRate,
          contribution: studentContribution,
        });

        lessonRevenue = studentContribution;
      }

      // Si aucun étudiant n'a été traité (filtre appliqué mais aucun étudiant correspondant)
      if (students.length === 0) {
        continue;
      }

      totalRevenue += lessonRevenue;

      // Ajouter la leçon formatée
      formattedLessons.push({
        id: lesson.id,
        date: lesson.date, // Le champ date est déjà une string au format "yyyy-MM-dd"
        duration: lesson.duration,
        title: lesson.title,
        student: students[0] || { firstName: "Inconnu", lastName: "Élève" },
        price: lessonRevenue,
        courseTitle: lesson.course?.title,
      });
    }

    const response = {
      revenueTotal: totalRevenue,
      lessons: formattedLessons,
      period: {
        startDate,
        endDate,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données de revenus:",
      error
    );
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// Fonction utilitaire pour convertir la durée en heures
function parseDurationToHours(duration: string): number {
  if (!duration) return 0;

  const cleanDuration = duration.trim().toLowerCase();

  // Format "1h30" ou "1h"
  if (cleanDuration.includes("h")) {
    const parts = cleanDuration.split("h");
    if (parts.length === 2) {
      const hours = parseFloat(parts[0]) || 0;
      const minutes = parseFloat(parts[1]) || 0;
      return hours + minutes / 60;
    } else if (parts.length === 1) {
      return parseFloat(parts[0]) || 0;
    }
  }

  // Format "1:30"
  if (cleanDuration.includes(":")) {
    const [h, m] = cleanDuration.split(":").map(Number);
    return h + m / 60;
  }

  // Format décimal "1.5"
  if (cleanDuration.includes(".")) {
    return parseFloat(cleanDuration);
  }

  // Format minutes uniquement
  const minutes = parseInt(cleanDuration, 10);
  if (!isNaN(minutes)) {
    return minutes / 60;
  }

  return 0;
}
