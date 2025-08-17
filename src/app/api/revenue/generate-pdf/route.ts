import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseISO, startOfDay, endOfDay, format } from "date-fns";
import { fr } from "date-fns/locale";
import jsPDF from "jspdf";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// Fonction pour vérifier l'authentification
async function verifyAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    console.log("Auth header:", authHeader ? "Present" : "Missing");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Invalid auth header format");
      return null;
    }

    const token = authHeader.substring(7);
    console.log("Token length:", token.length);

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log("Token decoded for user:", decoded.id);

    // Vérifier que l'utilisateur existe toujours
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    console.log("User found:", !!user);
    return user;
  } catch (error) {
    console.error("Auth verification failed:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("PDF generation request received");

    // Vérifier l'authentification
    const user = await verifyAuth(request);
    if (!user) {
      console.log("Authentication failed");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    console.log("Authentication successful for user:", user.id);

    const body = await request.json();
    const { tutorId, startDate, endDate, studentId } = body;

    if (!tutorId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Paramètres manquants: tutorId, startDate, endDate" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur peut accéder aux données de ce tuteur
    if (user.role !== "tutor" || user.id !== tutorId) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
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
        student: true,
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

      if (lesson.lessonStudents && lesson.lessonStudents.length > 0) {
        for (const lessonStudent of lesson.lessonStudents) {
          const student = lessonStudent.student;

          // Si un étudiant spécifique est filtré, ne traiter que cet étudiant
          if (studentId && studentId !== "all" && student.id !== studentId) {
            continue;
          }

          const hourlyRate = Number(student.hourlyRate) || 30;
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

      formattedLessons.push({
        id: lesson.id,
        date: lesson.date,
        duration: lesson.duration,
        title: lesson.title,
        student: students[0] || { firstName: "Inconnu", lastName: "Élève" },
        price: lessonRevenue,
        courseTitle: lesson.course?.title,
      });
    }

    // Récupérer le nom de l'étudiant filtré si applicable
    let studentFilterName = undefined;
    if (studentId && studentId !== "all") {
      const filteredStudent = await prisma.student.findUnique({
        where: { id: studentId },
        select: { firstName: true, lastName: true },
      });
      if (filteredStudent) {
        studentFilterName = `${filteredStudent.firstName} ${filteredStudent.lastName}`;
      }
    }

    // Générer le PDF côté serveur
    const pdf = generateRevenuePDF({
      revenueTotal: totalRevenue,
      lessons: formattedLessons,
      period: { startDate, endDate },
      studentFilter: studentFilterName,
    });

    // Convertir le PDF en base64
    const pdfBase64 = pdf.output("datauristring");

    return NextResponse.json({
      success: true,
      pdfData: pdfBase64,
      filename: `rapport_revenus_${format(
        parseISO(startDate),
        "dd-MM-yyyy"
      )}_${format(parseISO(endDate), "dd-MM-yyyy")}.pdf`,
    });
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
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

  if (cleanDuration.includes(":")) {
    const [h, m] = cleanDuration.split(":").map(Number);
    return h + m / 60;
  }

  if (cleanDuration.includes(".")) {
    return parseFloat(cleanDuration);
  }

  const minutes = parseInt(cleanDuration, 10);
  if (!isNaN(minutes)) {
    return minutes / 60;
  }

  return 0;
}

// Fonction de génération du PDF (copiée du composant client)
function generateRevenuePDF(data: any) {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Optimize by pre-calculating colors
  const primaryColorRGB = [5, 15, 139]; // #050f8b
  const secondaryColorRGB = [223, 181, 41]; // #dfb529
  const textColorRGB = [55, 65, 81]; // #374151
  const lightGrayRGB = [243, 244, 246]; // #f3f4f6

  let yPosition = margin;

  // En-tête avec logo/titre
  pdf.setFillColor(primaryColorRGB[0], primaryColorRGB[1], primaryColorRGB[2]);
  pdf.rect(0, 0, pageWidth, 40, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text("TutorApp", margin, 25);

  pdf.setFontSize(14);
  pdf.setFont("helvetica", "normal");
  pdf.text("Rapport financier", margin, 35);

  yPosition = 50;

  // Informations de période
  pdf.setTextColor(textColorRGB[0], textColorRGB[1], textColorRGB[2]);
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("Période séléctionnée:", margin, yPosition);

  yPosition += 8;
  pdf.setFont("helvetica", "normal");
  pdf.text(
    `Du ${format(parseISO(data.period.startDate), "dd/MM/yyyy", {
      locale: fr,
    })} au ${format(parseISO(data.period.endDate), "dd/MM/yyyy", {
      locale: fr,
    })}`,
    margin,
    yPosition
  );

  yPosition += 8;
  pdf.text(
    `Rapport généré le: ${format(new Date(), "dd/MM/yyyy à HH:mm", {
      locale: fr,
    })}`,
    margin,
    yPosition
  );

  // Afficher le filtre étudiant si appliqué
  if (data.studentFilter) {
    yPosition += 8;
    pdf.setFont("helvetica", "bold");
    pdf.text(`Étudiant(s): ${data.studentFilter}`, margin, yPosition);
    pdf.setFont("helvetica", "normal");
  }

  yPosition += 20;

  // Résumé des revenus
  pdf.setFillColor(lightGrayRGB[0], lightGrayRGB[1], lightGrayRGB[2]);
  pdf.rect(margin, yPosition - 5, contentWidth, 25, "F");

  pdf.setTextColor(primaryColorRGB[0], primaryColorRGB[1], primaryColorRGB[2]);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("Résumé", margin + 5, yPosition);

  yPosition += 8;
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    `Revenu total: ${formatCurrency(data.revenueTotal)}`,
    margin + 5,
    yPosition
  );

  yPosition += 6;
  pdf.text(`Nombre de leçons: ${data.lessons.length}`, margin + 5, yPosition);

  yPosition += 6;
  const avgRevenue =
    data.lessons.length > 0 ? data.revenueTotal / data.lessons.length : 0;
  pdf.text(
    `Revenu moyen par leçon: ${formatCurrency(avgRevenue)}`,
    margin + 5,
    yPosition
  );

  yPosition += 30;

  // Détail des leçons
  pdf.setTextColor(primaryColorRGB[0], primaryColorRGB[1], primaryColorRGB[2]);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Détail des leçons", margin, yPosition);

  yPosition += 15;

  // En-têtes du tableau
  const tableHeaders = ["Date", "Leçon", "Élève", "Durée", "Montant"];
  const columnWidths = [25, 60, 40, 25, 30];
  let xPosition = margin;

  pdf.setFillColor(
    secondaryColorRGB[0],
    secondaryColorRGB[1],
    secondaryColorRGB[2]
  );
  pdf.rect(
    xPosition,
    yPosition - 5,
    columnWidths.reduce((a, b) => a + b, 0),
    8,
    "F"
  );

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");

  tableHeaders.forEach((header, index) => {
    pdf.text(header, xPosition + 2, yPosition);
    xPosition += columnWidths[index];
  });

  yPosition += 10;

  // Données du tableau
  pdf.setTextColor(textColorRGB[0], textColorRGB[1], textColorRGB[2]);
  pdf.setFont("helvetica", "normal");

  data.lessons.forEach((lesson: any, index: number) => {
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = margin + 10;
    }

    if (index % 2 === 0) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(
        margin,
        yPosition - 3,
        columnWidths.reduce((a, b) => a + b, 0),
        8,
        "F"
      );
    }

    xPosition = margin;

    pdf.text(
      format(parseISO(lesson.date), "dd/MM/yyyy", { locale: fr }),
      xPosition + 2,
      yPosition
    );
    xPosition += columnWidths[0];

    const title =
      lesson.title.length > 25
        ? lesson.title.substring(0, 22) + "..."
        : lesson.title;
    pdf.text(title, xPosition + 2, yPosition);
    xPosition += columnWidths[1];

    const studentName = `${lesson.student.firstName} ${lesson.student.lastName}`;
    pdf.text(studentName, xPosition + 2, yPosition);
    xPosition += columnWidths[2];

    pdf.text(formatDuration(lesson.duration), xPosition + 2, yPosition);
    xPosition += columnWidths[3];

    pdf.text(formatCurrency(lesson.price), xPosition + 2, yPosition);

    yPosition += 8;
  });

  // Pied de page
  const totalPages = (pdf as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setTextColor(128, 128, 128);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Page ${i} sur ${totalPages}`, pageWidth / 2, pageHeight - 10, {
      align: "center",
    });
  }

  return pdf;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

function formatDuration(duration: string): string {
  if (!duration) return "0h";

  const cleanDuration = duration.trim().toLowerCase();

  if (cleanDuration.includes("h")) {
    const parts = cleanDuration.split("h");
    if (parts.length === 2) {
      const hours = parseFloat(parts[0]) || 0;
      const minutes = parseFloat(parts[1]) || 0;
      return `${hours}h${minutes ? `${minutes}min` : ""}`;
    } else if (parts.length === 1) {
      const hours = parseFloat(parts[0]) || 0;
      return `${hours}h`;
    }
  }

  if (cleanDuration.includes(":")) {
    const [h, m] = cleanDuration.split(":").map(Number);
    return `${h}h${m ? `${m}min` : ""}`;
  }

  if (cleanDuration.includes(".")) {
    const hours = parseFloat(cleanDuration);
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h${minutes ? `${minutes}min` : ""}`;
  }

  const minutes = parseInt(cleanDuration, 10);
  if (!isNaN(minutes)) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins ? `${mins}min` : ""}`;
  }

  return "0h";
}
