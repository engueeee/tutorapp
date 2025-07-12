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
} from "date-fns";

function parseDurationToHours(duration: string): number {
  // Accepts "1:30" or "1.5" or "90" (minutes)
  if (!duration) return 0;
  if (duration.includes(":")) {
    const [h, m] = duration.split(":").map(Number);
    return h + (m ? m / 60 : 0);
  }
  if (duration.includes(".")) {
    return parseFloat(duration);
  }
  // Assume minutes
  const min = parseInt(duration, 10);
  if (!isNaN(min)) return min / 60;
  return 0;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tutorId = searchParams.get("tutorId");
  const range = searchParams.get("range") || "month";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

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

  // Fetch all lessons for this tutor in the range
  const lessons = await prisma.lesson.findMany({
    where: {
      tutorId,
      date: {
        gte: start.toISOString().slice(0, 10),
        lte: end.toISOString().slice(0, 10),
      },
    },
    include: {
      student: true,
    },
    orderBy: { date: "asc" },
  });

  // Calculate revenue for each lesson
  let totalRevenue = 0;
  let totalHours = 0;
  let lessonsCompleted = 0;
  let sumHourlyRate = 0;
  let hourlyRateCount = 0;
  const revenueByPeriod: Record<string, number> = {};

  for (const lesson of lessons) {
    const isPast = new Date(lesson.date) < now;
    const hours = parseDurationToHours(lesson.duration);
    const rate = lesson.student?.hourlyRate
      ? Number(lesson.student.hourlyRate)
      : 0;
    const revenue = rate * hours;
    if (isPast) {
      totalRevenue += revenue;
      totalHours += hours;
      lessonsCompleted++;
      sumHourlyRate += rate;
      hourlyRateCount++;
    }
    // Group by period (e.g., day)
    const periodKey = lesson.date;
    revenueByPeriod[periodKey] = (revenueByPeriod[periodKey] || 0) + revenue;
  }

  // Projected revenue (future lessons)
  let projectedRevenue = 0;
  for (const lesson of lessons) {
    if (new Date(lesson.date) >= now) {
      const hours = parseDurationToHours(lesson.duration);
      const rate = lesson.student?.hourlyRate
        ? Number(lesson.student.hourlyRate)
        : 0;
      projectedRevenue += rate * hours;
    }
  }

  const averageHourlyRate =
    hourlyRateCount > 0 ? sumHourlyRate / hourlyRateCount : 0;

  return NextResponse.json({
    totalRevenue,
    averageHourlyRate,
    lessonsCompleted,
    revenueByPeriod,
    projectedRevenue,
  });
}
