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
  Trash2,
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

          // Get student surnames for display
          const students =
            lesson.lessonStudents && lesson.lessonStudents.length > 0
              ? lesson.lessonStudents.map((ls: any) => ls.student)
              : [lesson.student];

          const studentSurnames = students
            .map((student: any) => student.firstName.toUpperCase())
            .join(", ");

          return {
            id: lesson.id,
            title: lesson.title || lesson.course?.title || "Leçon", // Show lesson name
            start: startDate,
            end: endDate,
            description: lesson.description,
            type: "lesson" as const,
            courseName: lesson.course?.title,
            studentName: studentSurnames, // Store surnames for display
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
        cursor: "pointer",
      },
    };
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (event.type === "lesson" && event.lessonData) {
      setSelectedLesson(event);
      setIsLessonDetailsModalOpen(true);
    } else {
      // For non-lesson events, show a simple confirmation dialog
      if (confirm(`Voulez-vous supprimer l'événement "${event.title}" ?`)) {
        handleDeleteEvent(event.id);
      }
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
      const importedEvents = parseICalFile(text);

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

  const handleImportFrenchSchoolCalendar = async (zone: string) => {
    try {
      const response = await fetch(
        `/api/calendar/import-french-school?zone=${zone}`
      );

      if (!response.ok) {
        throw new Error("Impossible de télécharger le calendrier");
      }

      const text = await response.text();
      const importedEvents = parseICalFile(text);

      setEvents((prev) => [...prev, ...importedEvents]);
      setIsImportModalOpen(false);
      toast.success("Calendrier scolaire importé", {
        description: `${importedEvents.length} événements du calendrier scolaire ont été importés.`,
      });
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Erreur", {
        description: "Impossible d'importer le calendrier scolaire.",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      // Find the event to get its type
      const eventToDelete = events.find((event) => event.id === eventId);

      if (!eventToDelete) {
        throw new Error("Événement non trouvé");
      }

      // If it's a lesson, we need to delete it from the database
      if (eventToDelete.type === "lesson" && eventToDelete.lessonData) {
        const response = await fetch(
          `/api/lessons/${eventToDelete.lessonData.id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Impossible de supprimer la leçon");
        }
      }

      // Remove from local state
      setEvents((prev) => prev.filter((event) => event.id !== eventId));

      // Close modal if open
      if (selectedLesson?.id === eventId) {
        setIsLessonDetailsModalOpen(false);
        setSelectedLesson(null);
      }

      toast.success("Événement supprimé", {
        description: "L'événement a été supprimé avec succès.",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Erreur", {
        description: "Impossible de supprimer l'événement.",
      });
    }
  };

  const handleClearAllEvents = () => {
    if (
      confirm(
        "Voulez-vous supprimer tous les événements personnels et importés ? Les leçons ne seront pas affectées."
      )
    ) {
      // Keep only lesson events
      setEvents((prev) => prev.filter((event) => event.type === "lesson"));
      toast.success("Événements supprimés", {
        description:
          "Tous les événements personnels et importés ont été supprimés.",
      });
    }
  };

  // Enhanced iCal parser function
  const parseICalFile = (text: string): CalendarEvent[] => {
    const lines = text.split("\n");
    const importedEvents: CalendarEvent[] = [];
    let currentEvent: any = {};
    let inEvent = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith("BEGIN:VEVENT")) {
        currentEvent = {};
        inEvent = true;
      } else if (line.startsWith("END:VEVENT")) {
        if (inEvent && currentEvent.start && currentEvent.title) {
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
        inEvent = false;
      } else if (inEvent) {
        if (line.startsWith("SUMMARY:")) {
          currentEvent.title = line
            .substring(8)
            .replace(/\\,/g, ",")
            .replace(/\\;/g, ";");
        } else if (line.startsWith("DTSTART")) {
          const dateStr = parseICalDate(line);
          if (dateStr) {
            currentEvent.start = dateStr;
          }
        } else if (line.startsWith("DTEND")) {
          const dateStr = parseICalDate(line);
          if (dateStr) {
            currentEvent.end = dateStr;
          }
        } else if (line.startsWith("DESCRIPTION:")) {
          currentEvent.description = line
            .substring(12)
            .replace(/\\,/g, ",")
            .replace(/\\;/g, ";");
        }
      }
    }

    return importedEvents;
  };

  // Helper function to parse iCal date formats
  const parseICalDate = (line: string): Date | null => {
    try {
      // Handle different iCal date formats
      if (line.includes("VALUE=DATE:")) {
        // Date only format (YYYYMMDD)
        const dateStr = line.split("VALUE=DATE:")[1];
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        return new Date(`${year}-${month}-${day}T00:00:00`);
      } else if (line.includes(":")) {
        // DateTime format (YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ)
        const dateStr = line.split(":")[1];
        if (dateStr.length >= 8) {
          const year = dateStr.substring(0, 4);
          const month = dateStr.substring(4, 6);
          const day = dateStr.substring(6, 8);

          if (dateStr.length >= 15) {
            // Has time component
            const hour = dateStr.substring(9, 11);
            const minute = dateStr.substring(11, 13);
            const second = dateStr.substring(13, 15);
            return new Date(
              `${year}-${month}-${day}T${hour}:${minute}:${second}`
            );
          } else {
            // Date only
            return new Date(`${year}-${month}-${day}T00:00:00`);
          }
        }
      }
    } catch (error) {
      console.error("Error parsing iCal date:", line, error);
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-100 to-gray-200">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-300 rounded-lg animate-pulse">
                  <div className="h-6 w-6 bg-gray-400 rounded"></div>
                </div>
                <div>
                  <div className="h-8 bg-gray-300 rounded w-32 animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-48 animate-pulse"></div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="h-10 bg-gray-300 rounded w-32 animate-pulse"></div>
                <div className="h-10 bg-gray-300 rounded w-40 animate-pulse"></div>
                <div className="h-10 bg-gray-300 rounded w-24 animate-pulse"></div>
                <div className="h-10 bg-gray-300 rounded w-24 animate-pulse"></div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-200 rounded-lg animate-pulse">
                    <div className="h-5 w-5 bg-gray-300 rounded"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse mb-1"></div>
                    <div className="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Legend skeleton */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-200 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Calendar skeleton */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="text-center">
                  <div className="h-6 bg-gray-200 rounded w-32 animate-pulse mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4">
              {/* Calendar grid skeleton */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="p-2 text-center">
                    <div className="h-4 bg-gray-200 rounded w-8 mx-auto animate-pulse"></div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 42 }).map((_, i) => (
                  <div
                    key={i}
                    className="min-h-[120px] p-2 border border-gray-100"
                  >
                    <div className="h-4 bg-gray-200 rounded w-6 mb-2 animate-pulse"></div>
                    <div className="space-y-1">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <div
                          key={j}
                          className="h-6 bg-gray-200 rounded animate-pulse"
                        ></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-primary to-primary-400 text-white">
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
                  <ImportCalendarForm
                    onSubmit={handleImportCalendar}
                    onImportFrenchSchoolCalendar={
                      handleImportFrenchSchoolCalendar
                    }
                  />
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

              <Button
                variant="outline"
                onClick={handleClearAllEvents}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Effacer tout
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
              <div className="w-4 h-4 rounded bg-primary shadow-sm"></div>
              <span className="font-medium">Leçons</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-secondary shadow-sm"></div>
              <span className="font-medium">Personnel</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500 shadow-sm"></div>
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
          <div className="bg-white h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              views={{
                month: true,
                week: true,
                day: true,
              }}
              view={view}
              onView={(newView) => setView(newView as "month" | "week" | "day")}
              date={date}
              onNavigate={(newDate) => setDate(newDate)}
              onSelectEvent={handleEventClick}
              eventPropGetter={eventStyleGetter}
              messages={{
                next: "Suivant",
                previous: "Précédent",
                today: "Aujourd'hui",
                month: "Mois",
                week: "Semaine",
                day: "Jour",
                noEventsInRange: "Aucun événement dans cette période.",
              }}
            />
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
            onDelete={handleDeleteEvent}
          />
        )}
      </Dialog>
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
function ImportCalendarForm({
  onSubmit,
  onImportFrenchSchoolCalendar,
}: {
  onSubmit: (file: File) => void;
  onImportFrenchSchoolCalendar: (zone: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [selectedZone, setSelectedZone] = useState<string>("zone-a");
  const [activeTab, setActiveTab] = useState<"file" | "french">("file");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      onSubmit(file);
    }
  };

  const handleFrenchSchoolImport = (e: React.FormEvent) => {
    e.preventDefault();
    onImportFrenchSchoolCalendar(selectedZone);
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          type="button"
          onClick={() => setActiveTab("file")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "file"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Fichier .ics
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("french")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "french"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Calendrier scolaire français
        </button>
      </div>

      {/* File Import Tab */}
      {activeTab === "file" && (
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
      )}

      {/* French School Calendar Tab */}
      {activeTab === "french" && (
        <form onSubmit={handleFrenchSchoolImport} className="space-y-4">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Sélectionnez votre zone scolaire
            </label>
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zone-a">Zone A</SelectItem>
                <SelectItem value="zone-b">Zone B</SelectItem>
                <SelectItem value="zone-c">Zone C</SelectItem>
                <SelectItem value="corse">Corse</SelectItem>
                <SelectItem value="guadeloupe">Guadeloupe</SelectItem>
                <SelectItem value="guyane">Guyane</SelectItem>
                <SelectItem value="martinique">Martinique</SelectItem>
                <SelectItem value="mayotte">Mayotte</SelectItem>
                <SelectItem value="nouvelle-caledonie">
                  Nouvelle Calédonie
                </SelectItem>
                <SelectItem value="polynesie">Polynésie</SelectItem>
                <SelectItem value="reunion">La Réunion</SelectItem>
                <SelectItem value="saint-pierre-et-miquelon">
                  Saint-Pierre-et-Miquelon
                </SelectItem>
                <SelectItem value="wallis-et-futuna">
                  Wallis et Futuna
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CalendarIcon className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Calendrier scolaire officiel</p>
                <p className="text-blue-600">
                  Importez automatiquement les vacances scolaires et jours
                  fériés de votre zone depuis data.gouv.fr
                </p>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Importer le calendrier scolaire
          </Button>
        </form>
      )}
    </div>
  );
}

// Lesson Details Modal Component
function LessonDetailsModal({
  lesson,
  onClose,
  onDelete,
}: {
  lesson: CalendarEvent;
  onClose: () => void;
  onDelete: (eventId: string) => void;
}) {
  if (!lesson.lessonData) return null;

  const lessonData = lesson.lessonData;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (dateString: string) => {
    const lessonDate = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lessonDay = new Date(
      lessonDate.getFullYear(),
      lessonDate.getMonth(),
      lessonDate.getDate()
    );

    if (lessonDay < today) return "bg-gray-100 text-gray-600"; // Past
    if (lessonDay.getTime() === today.getTime())
      return "bg-blue-100 text-blue-700"; // Today
    return "bg-green-100 text-green-700"; // Future
  };

  const getStatusText = (dateString: string) => {
    const lessonDate = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lessonDay = new Date(
      lessonDate.getFullYear(),
      lessonDate.getMonth(),
      lessonDate.getDate()
    );

    if (lessonDay < today) return "Terminé";
    if (lessonDay.getTime() === today.getTime()) return "Aujourd'hui";
    return "À venir";
  };

  return (
    <Dialog open={!!lesson} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {lessonData.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge and Actions */}
          <div className="flex items-center justify-between">
            <Badge className={`${getStatusColor(lessonData.date)}`}>
              {getStatusText(lessonData.date)}
            </Badge>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(lesson.id)}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          </div>

          {/* Lesson Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Informations générales
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">
                      {formatDate(lessonData.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">
                      {lessonData.startTime} - {lessonData.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">
                      {lessonData.course.title}
                    </span>
                  </div>
                  {lessonData.subject && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        {lessonData.subject}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {lessonData.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-gray-600">
                    {lessonData.description}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Participants</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {lessonData.tutor.firstName} {lessonData.tutor.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {lessonData.tutor.email}
                      </p>
                    </div>
                  </div>

                  {lessonData.lessonStudents &&
                  lessonData.lessonStudents.length > 0 ? (
                    lessonData.lessonStudents.map((ls, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {ls.student.firstName} {ls.student.lastName}
                          </p>
                          {ls.student.grade && (
                            <p className="text-xs text-gray-500">
                              Niveau: {ls.student.grade}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {lessonData.student.firstName}{" "}
                          {lessonData.student.lastName}
                        </p>
                        {lessonData.student.grade && (
                          <p className="text-xs text-gray-500">
                            Niveau: {lessonData.student.grade}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {lessonData.zoomLink && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Lien de visioconférence
                  </h4>
                  <a
                    href={lessonData.zoomLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Video className="h-4 w-4" />
                    Rejoindre la visioconférence
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
