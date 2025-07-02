import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  User,
  Video,
  BookOpen,
  ExternalLink,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  duration: string;
  zoomLink?: string;
  subject?: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    grade: string;
  };
  course: {
    id: string;
    title: string;
  };
}

interface LessonCardProps {
  lesson: Lesson;
  onEdit?: (lessonId: string) => void;
  onDelete?: (lessonId: string) => void;
}

export function LessonCard({ lesson, onEdit, onDelete }: LessonCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
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
    <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
              {lesson.title}
            </CardTitle>
            {lesson.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {lesson.description}
              </p>
            )}
          </div>
          <Badge className={getStatusColor(lesson.date)}>
            {getStatusText(lesson.date)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Course and Subject */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <BookOpen className="h-4 w-4" />
          <span className="font-medium">{lesson.course.title}</span>
          {lesson.subject && (
            <>
              <span>•</span>
              <span>{lesson.subject}</span>
            </>
          )}
        </div>

        {/* Student */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span className="font-medium">
            {lesson.student.firstName} {lesson.student.lastName}
          </span>
          <Badge variant="outline" className="text-xs">
            {lesson.student.grade}
          </Badge>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(lesson.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              {formatTime(lesson.startTime)} • {lesson.duration}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {lesson.zoomLink && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => window.open(lesson.zoomLink, "_blank")}
              >
                <Video className="h-3 w-3" />
                Rejoindre
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(lesson.id)}
                className="text-blue-600 hover:text-blue-700"
              >
                Modifier
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(lesson.id)}
                className="text-red-600 hover:text-red-700"
              >
                Supprimer
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
