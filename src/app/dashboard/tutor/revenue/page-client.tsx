"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/datepicker";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { RevenueHistogram } from "@/components/dashboard/RevenueHistogram";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  DollarSign,
  Clock,
  Calendar,
  Filter,
  X,
  Users,
  BookOpen,
} from "lucide-react";

const FILTERS = [
  { value: "day", label: "Jour" },
  { value: "week", label: "Semaine" },
  { value: "month", label: "Mois" },
  { value: "quarter", label: "Trimestre" },
  { value: "year", label: "Année" },
];

function formatCurrency(value: number) {
  return value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function formatDate(dateString: string, filter: string) {
  const date = parseISO(dateString);
  switch (filter) {
    case "day":
      return format(date, "HH:mm", { locale: fr });
    case "week":
      return format(date, "EEE", { locale: fr });
    case "month":
      return format(date, "d MMM", { locale: fr });
    case "quarter":
      return format(date, "MMM", { locale: fr });
    case "year":
      return format(date, "MMM", { locale: fr });
    default:
      return format(date, "d MMM", { locale: fr });
  }
}

function formatMonth(dateString: string) {
  const date = parseISO(dateString);
  return format(date, "MMM", { locale: fr });
}

function formatDuration(duration: string): string {
  if (!duration) return "0h";

  // Remove any extra spaces and convert to lowercase
  const cleanDuration = duration.trim().toLowerCase();

  // Handle formats like "1h", "1h30", "1.5h", "1.5h30"
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

  // Handle "1:30" format
  if (cleanDuration.includes(":")) {
    const [h, m] = cleanDuration.split(":").map(Number);
    return `${h}h${m ? `${m}min` : ""}`;
  }

  // Handle "1.5" format (decimal hours)
  if (cleanDuration.includes(".")) {
    const hours = parseFloat(cleanDuration);
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h${minutes ? `${minutes}min` : ""}`;
  }

  // Assume minutes if it's just a number
  const minutes = parseInt(cleanDuration, 10);
  if (!isNaN(minutes)) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins ? `${mins}min` : ""}`;
  }

  return "0h";
}

interface Course {
  id: string;
  title: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  hourlyRate?: number;
}

interface LessonDetail {
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
}

export default function RevenueDashboardPageClient() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("month");

  // Helper function to get current period label
  const getCurrentPeriodLabel = () => {
    const currentFilter = FILTERS.find((f) => f.value === filter);
    return currentFilter ? currentFilter.label : "";
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [yearlyData, setYearlyData] = useState<any[]>([]);

  // Filter states
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showLessonDetails, setShowLessonDetails] = useState(false);

  // Fetch courses and students for filters
  useEffect(() => {
    if (!user || user.role !== "tutor") return;

    // Fetch courses
    fetch(`/api/courses?tutorId=${user.id}`)
      .then(async (res) => {
        if (res.ok) {
          const coursesData = await res.json();
          setCourses(coursesData);
        }
      })
      .catch(console.error);

    // Fetch students
    fetch(`/api/students?tutorId=${user.id}`)
      .then(async (res) => {
        if (res.ok) {
          const studentsData = await res.json();
          setStudents(studentsData);
        }
      })
      .catch(console.error);
  }, [user]);

  // Build API URL with filters
  const buildApiUrl = () => {
    const params = new URLSearchParams({
      tutorId: user?.id || "",
      range: filter,
    });

    if (selectedCourse && selectedCourse !== "all")
      params.append("courseId", selectedCourse);
    if (selectedStudent && selectedStudent !== "all")
      params.append("studentId", selectedStudent);

    return `/api/revenue?${params.toString()}`;
  };

  useEffect(() => {
    if (!user || user.role !== "tutor") return;
    setLoading(true);
    setError(null);

    // Fetch data for current filter
    fetch(buildApiUrl())
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((d) => {
        setData(d);
        // Transform revenueByPeriod to array for recharts with formatted dates
        const arr = Object.entries(d.revenueByPeriod || {})
          .map(([date, value]) => ({
            date: formatDate(date, filter),
            value,
            fullDate: date,
          }))
          .sort(
            (a, b) =>
              new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
          );
        setChartData(arr);
      })
      .catch((err) => {
        setError(err.message || "Erreur lors du chargement des données");
      })
      .finally(() => setLoading(false));

    // Fetch yearly data for histogram with current filters
    const yearlyParams = new URLSearchParams({
      tutorId: user.id,
      range: "year",
    });
    if (selectedCourse && selectedCourse !== "all") {
      yearlyParams.append("courseId", selectedCourse);
    }
    if (selectedStudent && selectedStudent !== "all") {
      yearlyParams.append("studentId", selectedStudent);
    }

    fetch(`/api/revenue?${yearlyParams.toString()}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((d) => {
        // Transform yearly data into monthly histogram
        const monthlyData = Object.entries(d.revenueByPeriod || {})
          .map(([monthKey, value]) => ({
            month: formatMonth(monthKey + "-01"), // Add day to make it a valid date
            revenue: value,
            fullDate: monthKey,
          }))
          .sort(
            (a, b) =>
              new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
          )
          // Remove duplicates by month (in case API returns multiple entries for same month)
          .filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.fullDate === item.fullDate)
          );
        setYearlyData(monthlyData);
      })
      .catch((err) => {
        console.error("Error loading yearly data:", err);
      });
  }, [user, filter, selectedCourse, selectedStudent]);

  const totalRevenue = data?.totalRevenue || 0;
  const averageRate = data?.averageHourlyRate || 0;
  const lessonsCompleted = data?.lessonsCompleted || 0;
  const projectedRevenue = data?.projectedRevenue || 0;
  const lessonDetails = data?.lessonDetails || [];

  const clearFilters = () => {
    setSelectedCourse("all");
    setSelectedStudent("all");
  };

  const hasActiveFilters =
    selectedCourse !== "all" || selectedStudent !== "all";

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#050f8b] mb-2">Revenus</h1>
        <p className="text-gray-600">
          Suivez vos performances et tendances financières
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Time Filter */}
        <div>
          <Tabs value={filter} onValueChange={setFilter} className="w-full">
            <TabsList className="bg-[#dfb529]/10 w-full justify-start">
              {FILTERS.map((f) => (
                <TabsTrigger key={f.value} value={f.value} className="flex-1">
                  {f.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Course and Student Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Filtrer par cours
            </label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les cours" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les cours</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Filtrer par étudiant
            </label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les étudiants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les étudiants</SelectItem>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Effacer les filtres
              </Button>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {selectedCourse !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  Cours: {courses.find((c) => c.id === selectedCourse)?.title}
                </Badge>
              )}
              {selectedStudent !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Étudiant:{" "}
                  {
                    students.find((s) => s.id === selectedStudent)?.firstName
                  }{" "}
                  {students.find((s) => s.id === selectedStudent)?.lastName}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement...</div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center mb-4">{error}</div>
      ) : (
        <>
          {/* First Row: Total Revenue and Histogram */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Large Total Revenue Card */}
            <Card className="p-8 bg-gradient-to-r from-[#050f8b] to-[#0a1f9b] text-white flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm opacity-90 mb-2">
                  Revenu total ({getCurrentPeriodLabel().toLowerCase()})
                </div>
                <div className="text-5xl font-bold mb-2">
                  {formatCurrency(totalRevenue)}
                </div>
                <div className="text-sm opacity-75">
                  {hasActiveFilters
                    ? `${
                        selectedCourse !== "all"
                          ? `Cours: ${
                              courses.find((c) => c.id === selectedCourse)
                                ?.title
                            }`
                          : ""
                      }${
                        selectedCourse !== "all" && selectedStudent !== "all"
                          ? " • "
                          : ""
                      }${
                        selectedStudent !== "all"
                          ? `Étudiant: ${
                              students.find((s) => s.id === selectedStudent)
                                ?.firstName
                            } ${
                              students.find((s) => s.id === selectedStudent)
                                ?.lastName
                            }`
                          : ""
                      }`
                    : `${getCurrentPeriodLabel()} en cours`}
                </div>
              </div>
            </Card>

            {/* Histogram */}
            <RevenueHistogram
              data={yearlyData}
              title={`Répartition annuelle${
                selectedStudent !== "all"
                  ? ` (${
                      students.find((s) => s.id === selectedStudent)?.firstName
                    } ${
                      students.find((s) => s.id === selectedStudent)?.lastName
                    })`
                  : selectedCourse !== "all"
                  ? ` (${courses.find((c) => c.id === selectedCourse)?.title})`
                  : ""
              }`}
              subtitle="Distribution des revenus par mois sur l'année"
            />
          </div>

          {/* Second Row: Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-white border-[#dfb529]">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">
                  Taux horaire moyen
                  {selectedStudent !== "all" && (
                    <span className="text-xs text-[#dfb529] ml-1">
                      (
                      {
                        students.find((s) => s.id === selectedStudent)
                          ?.firstName
                      }{" "}
                      {students.find((s) => s.id === selectedStudent)?.lastName}
                      )
                    </span>
                  )}
                  {selectedCourse !== "all" && selectedStudent === "all" && (
                    <span className="text-xs text-[#dfb529] ml-1">
                      ({courses.find((c) => c.id === selectedCourse)?.title})
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-[#050f8b]">
                  {formatCurrency(averageRate)}
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white border-[#dfb529]">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">
                  Leçons terminées
                  {selectedStudent !== "all" && (
                    <span className="text-xs text-[#dfb529] ml-1">
                      (
                      {
                        students.find((s) => s.id === selectedStudent)
                          ?.firstName
                      }{" "}
                      {students.find((s) => s.id === selectedStudent)?.lastName}
                      )
                    </span>
                  )}
                  {selectedCourse !== "all" && selectedStudent === "all" && (
                    <span className="text-xs text-[#dfb529] ml-1">
                      ({courses.find((c) => c.id === selectedCourse)?.title})
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-[#050f8b]">
                  {lessonsCompleted}
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white border-[#dfb529]">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">
                  Revenu projeté
                  {selectedStudent !== "all" && (
                    <span className="text-xs text-[#dfb529] ml-1">
                      (
                      {
                        students.find((s) => s.id === selectedStudent)
                          ?.firstName
                      }{" "}
                      {students.find((s) => s.id === selectedStudent)?.lastName}
                      )
                    </span>
                  )}
                  {selectedCourse !== "all" && selectedStudent === "all" && (
                    <span className="text-xs text-[#dfb529] ml-1">
                      ({courses.find((c) => c.id === selectedCourse)?.title})
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-[#050f8b]">
                  {formatCurrency(projectedRevenue)}
                </div>
              </div>
            </Card>
          </div>

          {/* Third Row: Line Chart */}
          <Card className="p-6 bg-white border-[#dfb529] mb-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#050f8b] mb-2">
                Évolution des revenus
                {selectedStudent !== "all" && (
                  <span className="text-sm text-[#dfb529] ml-2">
                    ({students.find((s) => s.id === selectedStudent)?.firstName}{" "}
                    {students.find((s) => s.id === selectedStudent)?.lastName})
                  </span>
                )}
                {selectedCourse !== "all" && selectedStudent === "all" && (
                  <span className="text-sm text-[#dfb529] ml-2">
                    ({courses.find((c) => c.id === selectedCourse)?.title})
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-600">
                Tendance des revenus sur la période sélectionnée
              </p>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      formatCurrency(value).replace("€", "")
                    }
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Revenu",
                    ]}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#050f8b"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#dfb529",
                      stroke: "#050f8b",
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#dfb529",
                      stroke: "#050f8b",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Fourth Row: Lesson Details */}
          {lessonDetails.length > 0 && (
            <Card className="p-6 bg-white border-[#dfb529]">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#050f8b] mb-2">
                  Détail des leçons
                  {selectedStudent !== "all" && (
                    <span className="text-sm text-[#dfb529] ml-2">
                      (
                      {
                        students.find((s) => s.id === selectedStudent)
                          ?.firstName
                      }{" "}
                      {students.find((s) => s.id === selectedStudent)?.lastName}
                      )
                    </span>
                  )}
                  {selectedCourse !== "all" && selectedStudent === "all" && (
                    <span className="text-sm text-[#dfb529] ml-2">
                      ({courses.find((c) => c.id === selectedCourse)?.title})
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-600">
                  Répartition détaillée des revenus par leçon
                </p>
              </div>

              <div className="space-y-4">
                {lessonDetails.map((lesson: LessonDetail) => (
                  <div
                    key={lesson.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {lesson.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {lesson.courseTitle} •{" "}
                          {format(parseISO(lesson.date), "dd/MM/yyyy", {
                            locale: fr,
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#050f8b]">
                          {formatCurrency(lesson.revenue)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDuration(lesson.duration)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {lesson.students.map(
                        (
                          student: {
                            id: string;
                            firstName: string;
                            lastName: string;
                            hourlyRate: number;
                            contribution: number;
                          },
                          index: number
                        ) => (
                          <div
                            key={`${lesson.id}-${student.id}-${index}`}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-gray-700">
                              {student.firstName} {student.lastName}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">
                                {formatDuration(lesson.duration)} ×{" "}
                                {formatCurrency(student.hourlyRate)}/h
                              </span>
                              <span className="font-medium text-[#050f8b]">
                                = {formatCurrency(student.contribution)}
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
