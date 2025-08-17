"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, BookOpen, Clock, Video } from "lucide-react";
import { Course } from "@/modules/dashboard/types";

interface CourseDetailHeaderProps {
  course: Course;
}

export function CourseDetailHeader({ course }: CourseDetailHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTotalLessons = () => {
    return course.lessons?.length || 0;
  };

  const getTotalStudents = () => {
    return course.students?.length || 0;
  };

  const getUpcomingLessons = () => {
    if (!course.lessons) return 0;
    const now = new Date();
    return course.lessons.filter((lesson) => new Date(lesson.date) > now)
      .length;
  };

  const getPastLessons = () => {
    if (!course.lessons) return 0;
    const now = new Date();
    return course.lessons.filter((lesson) => new Date(lesson.date) <= now)
      .length;
  };

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-secondary/5">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl font-bold text-gray-900">
                {course.title}
              </CardTitle>
              {course.isActive !== false && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Active
                </Badge>
              )}
            </div>

            {course.description && (
              <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
                {course.description}
              </p>
            )}

            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Créé le {formatDate(course.createdAt)}
              </span>
              {course.zoomLink && (
                <a
                  href={course.zoomLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                >
                  <Video className="h-4 w-4" />
                  Lien Zoom
                </a>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Students */}
          <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {getTotalStudents()}
            </div>
            <div className="text-xs text-gray-500">Étudiants</div>
          </div>

          {/* Total Lessons */}
          <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-center mb-2">
              <BookOpen className="h-5 w-5 text-secondary" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {getTotalLessons()}
            </div>
            <div className="text-xs text-gray-500">Leçons</div>
          </div>

          {/* Upcoming Lessons */}
          <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {getUpcomingLessons()}
            </div>
            <div className="text-xs text-gray-500">À venir</div>
          </div>

          {/* Past Lessons */}
          <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-5 w-5 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {getPastLessons()}
            </div>
            <div className="text-xs text-gray-500">Terminées</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
