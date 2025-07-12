"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addMinutes,
  addHours,
} from "date-fns";
import { fr } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Download,
  Upload,
  Calendar as CalendarIcon,
  Clock,
  User,
  BookOpen,
  Video,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Users,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { LessonCard } from "@/modules/dashboard/lessons/LessonCard";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const locales = {
  fr: fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  type: "lesson" | "personal" | "imported";
  courseName?: string;
  studentName?: string;
  tutorName?: string;
  zoomLink?: string;
  subject?: string;
  color?: string;
  // Add lesson-specific fields for the modal
  lessonData?: {
    id: string;
    title: string;
    description?: string;
    date: string;
    startTime: string;
    duration: string;
    zoomLink?: string;
    subject?: string;
    course: {
      id: string;
      title: string;
    };
    student: {
      id: string;
      firstName: string;
      lastName: string;
      grade?: string;
    };
    lessonStudents?: {
      student: {
        id: string;
        firstName: string;
        lastName: string;
        grade?: string;
      };
    }[];
    tutor: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

interface CalendarComponentProps {
  userId: string;
  userRole: "student" | "tutor";
}

// Utility function to parse duration string and calculate end time
function calculateEndTime(startTime: string, duration: string): Date {
  const [hours, minutes] = startTime.split(":").map(Number);
  let startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);

  // Parse duration string (e.g., "1h", "30min", "1h30min")
  let totalMinutes = 0;

  // Handle hours
  const hourMatch = duration.match(/(\d+)h/);
  if (hourMatch) {
    totalMinutes += parseInt(hourMatch[1]) * 60;
  }

  // Handle minutes
  const minuteMatch = duration.match(/(\d+)min/);
  if (minuteMatch) {
    totalMinutes += parseInt(minuteMatch[1]);
  }

  // If no specific format found, try to parse as just minutes
  if (totalMinutes === 0) {
    const justMinutes = parseInt(duration);
    if (!isNaN(justMinutes)) {
      totalMinutes = justMinutes;
    }
  }

  // Calculate end time
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + totalMinutes);

  return endDate;
}

export function CalendarComponent({
  userId,
  userRole,
}: CalendarComponentProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isLessonDetailsModalOpen, setIsLessonDetailsModalOpen] =
    useState(false);
  const [selectedLesson, setSelectedLesson] = useState<CalendarEvent | null>(
    null
  );
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Fetch lessons and convert to calendar events
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        let url = "";

        if (userRole === "tutor") {
          url = `/api/lessons?tutorId=${userId}`;
        } else {
          url = `/api/lessons?studentId=${userId}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch lessons");

        const lessons = await response.json();

        const calendarEvents: CalendarEvent[] = lessons.map((lesson: any) => {
          const startDate = new Date(`${lesson.date}T${lesson.startTime}`);
          const endDate = calculateEndTime(lesson.startTime, lesson.duration);

          // Set the end date to the same date as start date but with calculated end time
          endDate.setFullYear(startDate.getFullYear());
          endDate.setMonth(startDate.getMonth());
          endDate.setDate(startDate.getDate());

          // Get student names for display
          const students =
            lesson.lessonStudents && lesson.lessonStudents.length > 0
              ? lesson.lessonStudents.map((ls: any) => ls.student)
              : [lesson.student];

          const studentNames = students
            .map((student: any) => `${student.firstName} ${student.lastName}`)
            .join(", ");

          return {
            id: lesson.id,
            title: studentNames, // Show only student names
            start: startDate,
            end: endDate,
            description: lesson.description,
            type: "lesson" as const,
            courseName: lesson.course?.title,
            studentName: studentNames,
            tutorName: lesson.tutor?.firstName + " " + lesson.tutor?.lastName,
            zoomLink: lesson.zoomLink,
            subject: lesson.subject,
            color: "#050f8b", // Primary color for lessons
            lessonData: lesson, // Store full lesson data for modal
          };
        });

        setEvents(calendarEvents);
      } catch (error) {
        console.error("Error fetching lessons:", error);
        toast.error("Erreur", {
          description: "Impossible de charger les leçons.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [userId, userRole]);

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = "#050f8b"; // Default primary color

    switch (event.type) {
      case "lesson":
        backgroundColor = "#050f8b";
        break;
      case "personal":
        backgroundColor = "#dfb529"; // Secondary color
        break;
      case "imported":
        backgroundColor = "#10b981"; // Green for imported events
        break;
    }

    return {
      style: {
        backgroundColor,
        color: "white",
        borderRadius: "8px",
        border: "none",
        padding: "4px 8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        fontSize: "12px",
        fontWeight: "500",
      },
    };
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (event.type === "lesson" && event.lessonData) {
      setSelectedLesson(event);
      setIsLessonDetailsModalOpen(true);
    }
  };

  const handleAddEvent = async (eventData: any) => {
    const startDate = new Date(eventData.date + "T" + eventData.startTime);
    const endDate = new Date(eventData.date + "T" + eventData.endTime);

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: eventData.title,
      start: startDate,
      end: endDate,
      description: eventData.description,
      type: eventData.type as "lesson" | "personal" | "imported",
      color: eventData.type === "lesson" ? "#050f8b" : "#dfb529",
    };

    setEvents((prev) => [...prev, newEvent]);
    setIsAddEventModalOpen(false);
    toast.success("Événement ajouté", {
      description: "L'événement a été ajouté au calendrier.",
    });
  };

  const handleExportCalendar = async () => {
    try {
      const { createEvents } = await import("ics");

      const icsEvents = events.map((event) => ({
        start: event.start,
        end: event.end,
        title: event.title,
        description: event.description || "",
        location: event.zoomLink || "",
      }));

      const { error, value } = createEvents(icsEvents as any);

      if (error || !value) {
        throw new Error("Erreur lors de la création du fichier ICS");
      }

      const blob = new Blob([value], { type: "text/calendar" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "calendar.ics";
      link.click();
      URL.revokeObjectURL(url);

      toast.success("Calendrier exporté", {
        description: "Le calendrier a été exporté avec succès.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erreur", {
        description: "Impossible d'exporter le calendrier.",
      });
    }
  };

  const handleImportCalendar = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split("\n");
      const importedEvents: CalendarEvent[] = [];

      let currentEvent: any = {};

      for (const line of lines) {
        if (line.startsWith("BEGIN:VEVENT")) {
          currentEvent = {};
        } else if (line.startsWith("END:VEVENT")) {
          if (currentEvent.start && currentEvent.title) {
            importedEvents.push({
              id: Date.now().toString() + Math.random(),
              title: currentEvent.title,
              start: new Date(currentEvent.start),
              end: new Date(currentEvent.end || currentEvent.start),
              description: currentEvent.description,
              type: "imported" as const,
              color: "#10b981",
            });
          }
        } else if (line.startsWith("SUMMARY:")) {
          currentEvent.title = line.substring(8);
        } else if (line.startsWith("DTSTART:")) {
          const dateStr = line.substring(8);
          currentEvent.start = new Date(
            dateStr.substring(0, 4) +
              "-" +
              dateStr.substring(4, 6) +
              "-" +
              dateStr.substring(6, 8) +
              "T" +
              dateStr.substring(9, 11) +
              ":" +
              dateStr.substring(11, 13) +
              ":" +
              dateStr.substring(13, 15)
          );
        } else if (line.startsWith("DTEND:")) {
          const dateStr = line.substring(6);
          currentEvent.end = new Date(
            dateStr.substring(0, 4) +
              "-" +
              dateStr.substring(4, 6) +
              "-" +
              dateStr.substring(6, 8) +
              "T" +
              dateStr.substring(9, 11) +
              ":" +
              dateStr.substring(11, 13) +
              ":" +
              dateStr.substring(13, 15)
          );
        } else if (line.startsWith("DESCRIPTION:")) {
          currentEvent.description = line.substring(12);
        }
      }

      setEvents((prev) => [...prev, ...importedEvents]);
      setIsImportModalOpen(false);
      toast.success("Calendrier importé", {
        description: `${importedEvents.length} événements ont été importés.`,
      });
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Erreur", {
        description: "Impossible d'importer le fichier.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Calendrier</CardTitle>
                <CardDescription className="text-blue-100">
                  Gérez vos leçons et événements
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Select
                value={view}
                onValueChange={(value: any) => setView(value)}
              >
                <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Mois</SelectItem>
                  <SelectItem value="week">Semaine</SelectItem>
                  <SelectItem value="day">Jour</SelectItem>
                </SelectContent>
              </Select>

              <Dialog
                open={isAddEventModalOpen}
                onOpenChange={setIsAddEventModalOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-white/20 hover:bg-white/30 border-white/20">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un événement
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un événement</DialogTitle>
                  </DialogHeader>
                  <AddEventForm onSubmit={handleAddEvent} />
                </DialogContent>
              </Dialog>

              <Dialog
                open={isImportModalOpen}
                onOpenChange={setIsImportModalOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Importer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Importer un calendrier</DialogTitle>
                  </DialogHeader>
                  <ImportCalendarForm onSubmit={handleImportCalendar} />
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                onClick={handleExportCalendar}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <CalendarDays className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Total des leçons
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {events.filter((e) => e.type === "lesson").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">
                  Événements personnels
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {events.filter((e) => e.type === "personal").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-600">
                  Événements importés
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {events.filter((e) => e.type === "imported").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#050f8b] shadow-sm"></div>
              <span className="font-medium">Leçons</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#dfb529] shadow-sm"></div>
              <span className="font-medium">Personnel</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#10b981] shadow-sm"></div>
              <span className="font-medium">Importé</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newDate = new Date(date);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setDate(newDate);
                }}
                className="hover:bg-white/50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {date.toLocaleDateString("fr-FR", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <p className="text-sm text-gray-600">
                  {view === "month"
                    ? "Vue mensuelle"
                    : view === "week"
                    ? "Vue hebdomadaire"
                    : "Vue quotidienne"}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newDate = new Date(date);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setDate(newDate);
                }}
                className="hover:bg-white/50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDate(new Date())}
                className="text-xs"
              >
                Aujourd'hui
              </Button>

              <Select
                value={view}
                onValueChange={(value: any) => setView(value)}
              >
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Mois</SelectItem>
                  <SelectItem value="week">Semaine</SelectItem>
                  <SelectItem value="day">Jour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="bg-white">
            {view === "month" && (
              <MonthView
                date={date}
                events={events}
                onEventClick={handleEventClick}
              />
            )}
            {view === "week" && (
              <WeekView
                date={date}
                events={events}
                onEventClick={handleEventClick}
              />
            )}
            {view === "day" && (
              <DayView
                date={date}
                events={events}
                onEventClick={handleEventClick}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lesson Details Modal */}
      <Dialog
        open={isLessonDetailsModalOpen}
        onOpenChange={setIsLessonDetailsModalOpen}
      >
        {selectedLesson && (
          <LessonDetailsModal
            lesson={selectedLesson}
            onClose={() => {
              setIsLessonDetailsModalOpen(false);
              setSelectedLesson(null);
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

// Custom event component to show more details
function CustomEventComponent({ event }: { event: CalendarEvent }) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-1">
      <div className="font-medium text-xs">{event.title}</div>
      {event.courseName && (
        <div className="text-xs opacity-75">{event.courseName}</div>
      )}
      <div className="text-xs opacity-75">
        {formatTime(event.start)} - {formatTime(event.end)}
      </div>
    </div>
  );
}

// Add Event Form Component
function AddEventForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    description: "",
    type: "personal",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Titre de l'événement"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="personal">Personnel</SelectItem>
            <SelectItem value="lesson">Leçon</SelectItem>
            <SelectItem value="imported">Importé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="time"
          value={formData.startTime}
          onChange={(e) =>
            setFormData({ ...formData, startTime: e.target.value })
          }
          required
        />
        <Input
          type="time"
          value={formData.endTime}
          onChange={(e) =>
            setFormData({ ...formData, endTime: e.target.value })
          }
          required
        />
      </div>

      <Textarea
        placeholder="Description (optionnel)"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
      />

      <Button type="submit" className="w-full">
        Ajouter l'événement
      </Button>
    </form>
  );
}

// Import Calendar Form Component
function ImportCalendarForm({ onSubmit }: { onSubmit: (file: File) => void }) {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      onSubmit(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          accept=".ics,.ical"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
          id="calendar-file"
        />
        <label htmlFor="calendar-file" className="cursor-pointer">
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">
            Cliquez pour sélectionner un fichier .ics
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Formats supportés: Apple Calendar, Google Calendar, Outlook
          </p>
        </label>
      </div>

      {file && (
        <div className="text-sm text-gray-600">
          Fichier sélectionné: {file.name}
        </div>
      )}

      <Button type="submit" disabled={!file} className="w-full">
        Importer le calendrier
      </Button>
    </form>
  );
}

// Lesson Details Modal Component
function LessonDetailsModal({
  lesson,
  onClose,
}: {
  lesson: CalendarEvent;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!lesson} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            <VisuallyHidden>Détails de la leçon</VisuallyHidden>
          </DialogTitle>
        </DialogHeader>
        {lesson.lessonData && (
          <LessonCard
            lesson={{
              ...lesson.lessonData,
              student: {
                ...lesson.lessonData.student,
                grade: lesson.lessonData.student.grade ?? "",
              },
              lessonStudents: lesson.lessonData.lessonStudents
                ? lesson.lessonData.lessonStudents.map((ls) => ({
                    student: {
                      ...ls.student,
                      grade: ls.student.grade ?? "",
                    },
                  }))
                : undefined,
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// Custom Calendar View Components
function MonthView({
  date,
  events,
  onEventClick,
}: {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}) {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startOfMonth.getDay());

  const days = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endOfMonth || currentDate.getDay() !== 0) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const today = new Date();
  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isCurrentMonth = (date: Date) =>
    date.getMonth() === endOfMonth.getMonth();

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  return (
    <div className="p-4">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          return (
            <div
              key={index}
              className={`min-h-[120px] p-2 border border-gray-100 hover:bg-gray-50 transition-colors ${
                !isCurrentMonth(day) ? "bg-gray-50 text-gray-400" : ""
              }`}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  isToday(day)
                    ? "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    : ""
                }`}
              >
                {day.getDate()}
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    onClick={() => onEventClick(event)}
                    className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: event.color || "#050f8b",
                      color: "white",
                    }}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="text-xs opacity-90">
                      {event.start.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayEvents.length - 3} autres
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({
  date,
  events,
  onEventClick,
}: {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}) {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());

  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
  }

  const today = new Date();
  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          return (
            <div key={index} className="min-h-[400px]">
              <div
                className={`p-2 text-center border-b ${
                  isToday(day)
                    ? "bg-blue-50 border-blue-200"
                    : "border-gray-200"
                }`}
              >
                <div className="text-sm font-medium text-gray-600">
                  {day.toLocaleDateString("fr-FR", { weekday: "short" })}
                </div>
                <div
                  className={`text-lg font-bold ${
                    isToday(day) ? "text-blue-600" : "text-gray-900"
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>

              <div className="p-2 space-y-2">
                {dayEvents.map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    onClick={() => onEventClick(event)}
                    className="p-2 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                    style={{
                      backgroundColor: event.color || "#050f8b",
                      color: "white",
                    }}
                  >
                    <div className="font-medium text-sm">{event.title}</div>
                    <div className="text-xs opacity-90">
                      {event.start.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -
                      {event.end.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayView({
  date,
  events,
  onEventClick,
}: {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}) {
  const today = new Date();
  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const getEventsForDate = (date: Date) => {
    return events
      .filter((event) => {
        const eventDate = new Date(event.start);
        return (
          eventDate.getDate() === date.getDate() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getFullYear() === date.getFullYear()
        );
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  };

  const dayEvents = getEventsForDate(date);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {date.toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </h2>
        {isToday(date) && (
          <Badge variant="secondary" className="mt-2">
            Aujourd'hui
          </Badge>
        )}
      </div>

      {dayEvents.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun événement
          </h3>
          <p className="text-gray-500">
            Aucun événement programmé pour aujourd'hui.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {dayEvents.map((event, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onEventClick(event)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: event.color || "#050f8b" }}
                      />
                      <h3 className="font-semibold text-gray-900">
                        {event.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {event.start.toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -
                          {event.end.toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {event.courseName && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{event.courseName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {event.type === "lesson"
                      ? "Leçon"
                      : event.type === "personal"
                      ? "Personnel"
                      : "Importé"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
