"use client";

import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, Video, BookOpen } from "lucide-react";

interface LessonCardProps {
  lesson: {
    id: string;
    title: string;
    description?: string | null;
    date: string;
    startTime: string;
    duration?: string;
    zoomLink?: string | null;
    subject?: string | null;
    course?: {
      title: string;
    };
  };
  showCourse?: boolean;
  className?: string;
}

export function LessonCard({
  lesson,
  showCourse = false,
  className = "",
}: LessonCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Format HH:MM
  };

  const isPast = new Date(lesson.date) < new Date();

  const getTimeUntilLesson = (dateString: string) => {
    const lessonDate = new Date(dateString);
    const now = new Date();
    const diffTime = lessonDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return null; // Past lesson

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Demain";
    if (diffDays <= 7) return `${diffDays} jour${diffDays > 1 ? "s" : ""}`;

    const diffWeeks = Math.ceil(diffDays / 7);
    if (diffWeeks <= 4)
      return `${diffWeeks} semaine${diffWeeks > 1 ? "s" : ""}`;

    return "À venir";
  };

  const timeUntilLesson = getTimeUntilLesson(lesson.date);

  return (
    <div
      className={`flex items-center justify-between p-3 border rounded-lg ${className}`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h5 className="font-medium text-gray-900">{lesson.title}</h5>
          {lesson.subject && (
            <Badge variant="primaryOutline" className="text-xs">
              {lesson.subject}
            </Badge>
          )}
        </div>

        {showCourse && lesson.course && (
          <p className="text-sm text-gray-600 mt-1">{lesson.course.title}</p>
        )}

        <div className="flex items-center gap-4 mt-1">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            {formatDate(lesson.date)}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            {lesson.startTime ? formatTime(lesson.startTime) : "N/A"}
          </span>
          {lesson.zoomLink && (
            <a
              href={lesson.zoomLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Video className="h-3 w-3" />
              Rejoindre
            </a>
          )}
        </div>

        {lesson.description && (
          <div className="flex items-center gap-1">
            <span className="flex items-center gap-1 text-[13px] pt-3 text-gray-500">
              <BookOpen className="h-4 w-4" />
              {lesson.description}
            </span>
          </div>
        )}
      </div>

      <Badge
        variant={isPast ? "secondary" : "primary"}
        className="flex items-center gap-1 ml-2"
      >
        {isPast ? (
          <CheckCircle className="h-3 w-3" />
        ) : (
          <Clock className="h-3 w-3" />
        )}
        {isPast ? "Terminée" : timeUntilLesson}
      </Badge>
    </div>
  );
}
