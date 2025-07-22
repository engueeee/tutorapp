import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  parseISO,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  format,
} from "date-fns";
import { fr } from "date-fns/locale";

function parseDurationToHours(duration: string): number {
  // Accepts "1:30", "1.5", "90" (minutes), "1h", "1h30", "1.5h", "1.5h30", etc.
  if (!duration) return 0;

  // Remove any extra spaces and convert to lowercase
  const cleanDuration = duration.trim().toLowerCase();

  // Handle formats like "1h", "1h30", "1.5h", "1.5h30"
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

  // Handle "1:30" format
  if (cleanDuration.includes(":")) {
    const [h, m] = cleanDuration.split(":").map(Number);
    return h + (m ? m / 60 : 0);
  }

  // Handle "1.5" format (decimal hours)
  if (cleanDuration.includes(".")) {
    return parseFloat(cleanDuration);
  }

  // Assume minutes if it's just a number
  const min = parseInt(cleanDuration, 10);
  if (!isNaN(min)) return min / 60;

  return 0;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tutorId = searchParams.get("tutorId");
  const range = searchParams.get("range") || "month";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const courseId = searchParams.get("courseId");
  const studentId = searchParams.get("studentId");

  if (!tutorId) {
    return NextResponse.json({ error: "Missing tutorId" }, { status: 400 });
  }

  // Determine date range
  let start: Date, end: Date;
  const now = new Date();
  switch (range) {
    case "day":
      start = startOfDay(startDate ? parseISO(startDate) : now);
      end = endOfDay(endDate ? parseISO(endDate) : now);
      break;
    case "week":
      start = startOfWeek(startDate ? parseISO(startDate) : now);
      end = endOfWeek(endDate ? parseISO(endDate) : now);
      break;
    case "month":
      start = startOfMonth(startDate ? parseISO(startDate) : now);
      end = endOfMonth(endDate ? parseISO(endDate) : now);
      break;
    case "quarter":
      start = startOfQuarter(startDate ? parseISO(startDate) : now);
      end = endOfQuarter(endDate ? parseISO(endDate) : now);
      break;
    case "year":
      start = startOfYear(startDate ? parseISO(startDate) : now);
      end = endOfYear(endDate ? parseISO(endDate) : now);
      break;
    default:
      start = startOfMonth(now);
      end = endOfMonth(now);
  }

  // Build where clause for lessons
  const lessonWhere: any = {
    tutorId,
    date: {
      gte: start.toISOString().slice(0, 10),
      lte: end.toISOString().slice(0, 10),
    },
  };

  // Add course filter
  if (courseId) {
    lessonWhere.courseId = courseId;
  }

  // Add student filter
  if (studentId) {
    lessonWhere.OR = [
      { studentId: studentId },
      {
        lessonStudents: {
          some: {
            studentId: studentId,
          },
        },
      },
    ];
  }

  // Fetch all lessons for this tutor in the range with all related students
  const lessons = await prisma.lesson.findMany({
    where: lessonWhere,
    include: {
      student: true, // Main student
      lessonStudents: {
        include: {
          student: true, // Additional students
        },
      },
      course: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { date: "asc" },
  });

  // Calculate revenue for each lesson with detailed breakdown
  let totalRevenue = 0;
  let lessonsCompleted = 0;
  const revenueByPeriod: Record<string, number> = {};
  const studentHourlyRates: Record<string, number> = {};
  const lessonDetails: Array<{
    id: string;
    date: string;
    title: string;
    duration: string;
    courseTitle: string;
    revenue: number;
    students: Array<{
      id: string;
      firstName: string;
      lastName: string;
      hourlyRate: number;
      contribution: number;
    }>;
  }> = [];

  for (const lesson of lessons) {
    const isPast = new Date(lesson.date) < now;
    const hours = parseDurationToHours(lesson.duration);

    // Collect all students for this lesson (main student + additional students)
    const allStudents = [
      lesson.student,
      ...lesson.lessonStudents.map((ls) => ls.student),
    ].filter(Boolean); // Remove any null/undefined students

    // Remove duplicates based on student ID to avoid counting the same student twice
    const uniqueStudents = allStudents.filter(
      (student, index, self) =>
        index === self.findIndex((s) => s.id === student.id)
    );

    // Calculate revenue for each student separately
    const studentContributions = uniqueStudents.map((student) => {
      const rate = student.hourlyRate ? Number(student.hourlyRate) : 0;
      const contribution = rate * hours;
      return {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        hourlyRate: rate,
        contribution,
      };
    });

    // If a specific student is filtered, only count their contribution
    let lessonRevenue: number;
    let filteredStudentContributions: typeof studentContributions;

    if (studentId) {
      // Only include the selected student's contribution
      const selectedStudentContribution = studentContributions.find(
        (student) => student.id === studentId
      );

      if (selectedStudentContribution) {
        lessonRevenue = selectedStudentContribution.contribution;
        filteredStudentContributions = [selectedStudentContribution];
      } else {
        lessonRevenue = 0;
        filteredStudentContributions = [];
      }
    } else {
      // No student filter - count all students
      lessonRevenue = studentContributions.reduce(
        (sum, student) => sum + student.contribution,
        0
      );
      filteredStudentContributions = studentContributions;
    }

    if (isPast) {
      totalRevenue += lessonRevenue;
      lessonsCompleted++;

      // Track unique student hourly rates for overall average calculation
      if (studentId) {
        // Only track the selected student's rate
        const selectedStudent = uniqueStudents.find(
          (student) => student.id === studentId
        );
        if (
          selectedStudent?.id &&
          selectedStudent?.hourlyRate &&
          Number(selectedStudent.hourlyRate) > 0
        ) {
          studentHourlyRates[selectedStudent.id] = Number(
            selectedStudent.hourlyRate
          );
        }
      } else {
        // Track all students' rates
        uniqueStudents.forEach((student) => {
          if (
            student.id &&
            student.hourlyRate &&
            Number(student.hourlyRate) > 0
          ) {
            studentHourlyRates[student.id] = Number(student.hourlyRate);
          }
        });
      }
    }

    // Add lesson details for breakdown
    lessonDetails.push({
      id: lesson.id,
      date: lesson.date,
      title: lesson.title,
      duration: lesson.duration,
      courseTitle: lesson.course?.title || "Cours non spécifié",
      revenue: lessonRevenue,
      students: filteredStudentContributions,
    });

    // Group by period (e.g., day) for chart data
    const periodKey = lesson.date;
    revenueByPeriod[periodKey] =
      (revenueByPeriod[periodKey] || 0) + lessonRevenue;
  }

  // For yearly view, ensure we have all months represented
  if (range === "year") {
    const months = eachMonthOfInterval({ start, end });
    const completeRevenueByPeriod: Record<string, number> = {};

    // Initialize all months with 0 revenue
    months.forEach((month) => {
      const monthKey = format(month, "yyyy-MM");
      completeRevenueByPeriod[monthKey] = 0;
    });

    // Add actual revenue data
    Object.entries(revenueByPeriod).forEach(([date, revenue]) => {
      const monthKey = date.substring(0, 7); // Get YYYY-MM part
      if (completeRevenueByPeriod.hasOwnProperty(monthKey)) {
        completeRevenueByPeriod[monthKey] += revenue;
      }
    });

    // Replace the original revenueByPeriod with the complete one
    Object.assign(revenueByPeriod, completeRevenueByPeriod);
  }

  // Calculate average hourly rate from unique students
  const uniqueRates = Object.values(studentHourlyRates);
  const averageHourlyRate =
    uniqueRates.length > 0
      ? uniqueRates.reduce((sum, rate) => sum + rate, 0) / uniqueRates.length
      : 0;

  // Projected revenue (future lessons)
  let projectedRevenue = 0;
  for (const lesson of lessons) {
    if (new Date(lesson.date) >= now) {
      const hours = parseDurationToHours(lesson.duration);

      // Collect all students for this lesson
      const allStudents = [
        lesson.student,
        ...lesson.lessonStudents.map((ls) => ls.student),
      ].filter(Boolean);

      // Remove duplicates based on student ID to avoid counting the same student twice
      const uniqueStudents = allStudents.filter(
        (student, index, self) =>
          index === self.findIndex((s) => s.id === student.id)
      );

      // If a specific student is filtered, only count their contribution
      let lessonRevenue: number;

      if (studentId) {
        // Only include the selected student's contribution
        const selectedStudent = uniqueStudents.find(
          (student) => student.id === studentId
        );

        if (selectedStudent) {
          const rate = selectedStudent.hourlyRate
            ? Number(selectedStudent.hourlyRate)
            : 0;
          lessonRevenue = rate * hours;
        } else {
          lessonRevenue = 0;
        }
      } else {
        // No student filter - count all students
        lessonRevenue = uniqueStudents.reduce((total, student) => {
          const rate = student.hourlyRate ? Number(student.hourlyRate) : 0;
          return total + rate * hours;
        }, 0);
      }

      projectedRevenue += lessonRevenue;
    }
  }

  return NextResponse.json({
    totalRevenue,
    averageHourlyRate,
    lessonsCompleted,
    revenueByPeriod,
    projectedRevenue,
    lessonDetails,
  });
}
