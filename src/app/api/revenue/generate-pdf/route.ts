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

    // Récupérer les informations du tuteur
    const tutor = await prisma.user.findUnique({
      where: { id: tutorId },
      select: { firstName: true, lastName: true },
    });

    const tutorName = tutor ? `${tutor.firstName} ${tutor.lastName}` : "Tuteur";

    // Générer le PDF côté serveur
    const pdf = generateRevenuePDF({
      revenueTotal: totalRevenue,
      lessons: formattedLessons,
      period: { startDate, endDate },
      studentFilter: studentFilterName,
      tutorName: tutorName,
    });

    // Convertir le PDF en base64
    const pdfBase64 = pdf.output("datauristring");

    return NextResponse.json({
      success: true,
      pdfData: pdfBase64,
      filename: `bilan_financier_${format(
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
  const center = (pageWidth - 2 * margin) / 2;
  const contentWidth = pageWidth - 2 * margin;
  const font = "inter";

  // Optimize by pre-calculating colors
  const primaryColorRGB = [5, 15, 139]; // #050f8b
  const secondaryColorRGB = [223, 181, 41]; // #dfb529
  const textColorRGB = [55, 65, 81]; // #374151
  const lightGrayRGB = [243, 244, 246]; // #f3f4f6
  const borderColorRGB = [229, 231, 235]; // #e5e7eb
  const mutedTextRGB = [107, 114, 128]; // #6b7280

  let yPosition = margin;
  let xPos = margin;

  // En-tête avec logo/titre
  pdf.setFillColor(primaryColorRGB[0], primaryColorRGB[1], primaryColorRGB[2]);
  pdf.rect(0, 0, pageWidth, 40, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont(font, "bold");
  pdf.text("TutorApp", center, 15);

  pdf.setFontSize(16);
  pdf.setFont(font, "bold");
  pdf.text("Bilan financier", center, 30);

  yPosition = 50;

  // Informations de période
  pdf.setTextColor(textColorRGB[0], textColorRGB[1], textColorRGB[2]);
  pdf.setFontSize(12);
  pdf.setFont(font, "bold");
  pdf.text("Période séléctionnée: ", margin, yPosition);

  xPos += 40;

  pdf.setFont(font, "normal");
  pdf.text(
    `Du ${format(parseISO(data.period.startDate), "dd/MM/yyyy", {
      locale: fr,
    })} au ${format(parseISO(data.period.endDate), "dd/MM/yyyy", {
      locale: fr,
    })}`,
    xPos,
    yPosition
  );

  yPosition += 8;
  pdf.setFont(font, "bold");
  pdf.text("Rapport généré le: ", margin, yPosition);

  pdf.setFont(font, "normal");
  pdf.text(
    `${format(new Date(), "dd/MM/yyyy à HH:mm", {
      locale: fr,
    })}`,
    xPos,
    yPosition
  );

  yPosition += 8;
  pdf.setFont(font, "bold");
  pdf.text(`Tuteur: ${data.tutorName}`, margin, yPosition);
  pdf.setFont(font, "normal");

  // Afficher le filtre étudiant si appliqué
  if (data.studentFilter) {
    yPosition += 8;
    pdf.setFont(font, "bold");
    pdf.text(`Étudiant(s): ${data.studentFilter}`, margin, yPosition);
    pdf.setFont(font, "normal");
  }

  yPosition += 25;

  // Résumé des revenus
  pdf.setFillColor(lightGrayRGB[0], lightGrayRGB[1], lightGrayRGB[2]);
  pdf.rect(margin, yPosition - 7, contentWidth, 30, "F");

  pdf.setTextColor(primaryColorRGB[0], primaryColorRGB[1], primaryColorRGB[2]);
  pdf.setFontSize(16);
  pdf.setFont(font, "bold");
  pdf.text("Résumé", margin + 5, yPosition);

  yPosition += 8;
  pdf.setFontSize(12);
  pdf.setFont(font, "normal");
  pdf.text(
    `Coût total: ${formatCurrency(data.revenueTotal)}`,
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

  // Détail des leçons avec tableau agrandi
  pdf.setTextColor(primaryColorRGB[0], primaryColorRGB[1], primaryColorRGB[2]);
  pdf.setFontSize(16);
  pdf.setFont(font, "bold");
  pdf.text("Détail des leçons", margin, yPosition);

  yPosition += 15;

  // En-têtes du tableau agrandi
  const tableHeaders = ["Date", "Leçon", "Élève", "Durée", "Calcul", "Montant"];
  const columnWidths = [25, 40, 45, 25, 25, 20];
  let xPosition = margin;

  // En-tête du tableau avec fond coloré
  pdf.setFillColor(
    secondaryColorRGB[0],
    secondaryColorRGB[1],
    secondaryColorRGB[2]
  );
  pdf.rect(
    xPosition,
    yPosition - 5,
    columnWidths.reduce((a, b) => a + b, 0),
    10,
    "F"
  );

  // Ligne de bordure pour l'en-tête
  pdf.setDrawColor(borderColorRGB[0], borderColorRGB[1], borderColorRGB[2]);
  pdf.rect(
    xPosition,
    yPosition - 5,
    columnWidths.reduce((a, b) => a + b, 0),
    10,
    "S"
  );

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.setFont(font, "bold");

  tableHeaders.forEach((header, index) => {
    const columnCenter =
      margin +
      columnWidths.slice(0, index).reduce((a, b) => a + b, 0) +
      columnWidths[index] / 2;
    pdf.text(header, columnCenter, yPosition + 2, { align: "center" });
  });

  yPosition += 12;

  // Données du tableau avec calculs détaillés
  pdf.setTextColor(textColorRGB[0], textColorRGB[1], textColorRGB[2]);
  pdf.setFont(font, "normal");
  pdf.setFontSize(11);

  data.lessons.forEach((lesson: any, index: number) => {
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = margin + 10;
    }

    // Fond alterné pour les lignes
    if (index % 2 === 0) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(
        margin,
        yPosition - 3,
        columnWidths.reduce((a, b) => a + b, 0),
        10,
        "F"
      );
    }

    // Bordure de la ligne
    pdf.setDrawColor(borderColorRGB[0], borderColorRGB[1], borderColorRGB[2]);
    pdf.rect(
      margin,
      yPosition - 3,
      columnWidths.reduce((a, b) => a + b, 0),
      10,
      "S"
    );

    // Position verticale centrée dans la cellule (milieu de la hauteur de 10mm)
    const verticalCenter = yPosition + 2;

    // Date
    const dateColumnCenter = margin + columnWidths[0] / 2;
    pdf.text(
      format(parseISO(lesson.date), "dd/MM/yyyy", { locale: fr }),
      dateColumnCenter,
      verticalCenter,
      { align: "center" }
    );

    // Ligne verticale après la colonne Date
    const dateColumnEnd = margin + columnWidths[0];
    pdf.line(dateColumnEnd, yPosition - 3, dateColumnEnd, yPosition + 7);

    // Titre de la leçon
    const titleColumnCenter = margin + columnWidths[0] + columnWidths[1] / 2;
    const title =
      lesson.title.length > 25
        ? lesson.title.substring(0, 22) + "..."
        : lesson.title;
    pdf.text(title, titleColumnCenter, verticalCenter, { align: "center" });

    // Ligne verticale après la colonne Leçon
    const titleColumnEnd = margin + columnWidths[0] + columnWidths[1];
    pdf.line(titleColumnEnd, yPosition - 3, titleColumnEnd, yPosition + 7);

    // Nom de l'étudiant
    const studentColumnCenter =
      margin + columnWidths[0] + columnWidths[1] + columnWidths[2] / 2;
    const studentName = `${lesson.student.firstName} ${lesson.student.lastName}`;
    const shortName =
      studentName.length > 15
        ? studentName.substring(0, 12) + "..."
        : studentName;
    pdf.text(shortName, studentColumnCenter, verticalCenter, {
      align: "center",
    });

    // Ligne verticale après la colonne Élève
    const studentColumnEnd =
      margin + columnWidths[0] + columnWidths[1] + columnWidths[2];
    pdf.line(studentColumnEnd, yPosition - 3, studentColumnEnd, yPosition + 7);

    // Durée
    const durationColumnCenter =
      margin +
      columnWidths[0] +
      columnWidths[1] +
      columnWidths[2] +
      columnWidths[3] / 2;
    pdf.text(
      formatDuration(lesson.duration),
      durationColumnCenter,
      verticalCenter,
      {
        align: "center",
      }
    );

    // Ligne verticale après la colonne Durée
    const durationColumnEnd =
      margin +
      columnWidths[0] +
      columnWidths[1] +
      columnWidths[2] +
      columnWidths[3];
    pdf.line(
      durationColumnEnd,
      yPosition - 3,
      durationColumnEnd,
      yPosition + 7
    );

    // Calcul détaillé
    const calculationColumnCenter =
      margin +
      columnWidths[0] +
      columnWidths[1] +
      columnWidths[2] +
      columnWidths[3] +
      columnWidths[4] / 2;
    const durationInHours = parseDurationToHours(lesson.duration);
    const hourlyRate = durationInHours > 0 ? lesson.price / durationInHours : 0;
    const calculation = `${durationInHours.toFixed(1)}h × ${hourlyRate.toFixed(
      0
    )}€`;
    pdf.text(calculation, calculationColumnCenter, verticalCenter, {
      align: "center",
    });

    // Ligne verticale après la colonne Calcul
    const calculationColumnEnd =
      margin +
      columnWidths[0] +
      columnWidths[1] +
      columnWidths[2] +
      columnWidths[3] +
      columnWidths[4];
    pdf.line(
      calculationColumnEnd,
      yPosition - 3,
      calculationColumnEnd,
      yPosition + 7
    );

    // Montant
    const amountColumnCenter =
      margin +
      columnWidths[0] +
      columnWidths[1] +
      columnWidths[2] +
      columnWidths[3] +
      columnWidths[4] +
      columnWidths[5] / 2;
    pdf.setTextColor(
      primaryColorRGB[0],
      primaryColorRGB[1],
      primaryColorRGB[2]
    );
    pdf.setFont(font, "bold");
    pdf.text(formatCurrency(lesson.price), amountColumnCenter, verticalCenter, {
      align: "center",
    });
    pdf.setTextColor(textColorRGB[0], textColorRGB[1], textColorRGB[2]);
    pdf.setFont(font, "normal");

    yPosition += 10;
  });

  // Pied de page professionnel
  const totalPages = (pdf as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);

    // Ligne de séparation
    pdf.setDrawColor(borderColorRGB[0], borderColorRGB[1], borderColorRGB[2]);
    pdf.line(margin, pageHeight - 35, pageWidth - margin, pageHeight - 35);

    // Informations du pied de page
    pdf.setTextColor(mutedTextRGB[0], mutedTextRGB[1], mutedTextRGB[2]);
    pdf.setFontSize(8);
    pdf.setFont(font, "normal");

    // Numéro de page
    pdf.text(`Page ${i} sur ${totalPages}`, pageWidth / 2, pageHeight - 25, {
      align: "center",
    });

    // Logo en bas à gauche
    pdf.setTextColor(
      primaryColorRGB[0],
      primaryColorRGB[1],
      primaryColorRGB[2]
    );
    pdf.setFontSize(10);
    pdf.setFont(font, "bold");
    pdf.text("TutorApp", margin, pageHeight - 25);

    // Date en bas à droite
    pdf.setTextColor(mutedTextRGB[0], mutedTextRGB[1], mutedTextRGB[2]);
    pdf.setFontSize(8);
    pdf.setFont(font, "normal");
    pdf.text(
      format(new Date(), "dd/MM/yyyy", { locale: fr }),
      pageWidth - margin - 25,
      pageHeight - 25
    );

    // Informations supplémentaires
    pdf.setFontSize(7);
    pdf.text(
      "Rapport généré automatiquement • Données confidentielles",
      pageWidth / 2,
      pageHeight - 18,
      { align: "center" }
    );

    // Légende des calculs
    pdf.setFontSize(7);
    pdf.text(
      "Calculs: Durée × Taux horaire = Montant • Taux calculé automatiquement",
      pageWidth / 2,
      pageHeight - 12,
      { align: "center" }
    );
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
