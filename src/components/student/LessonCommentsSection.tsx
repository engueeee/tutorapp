"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { MessageSquare, Calendar, Clock, BookOpen } from "lucide-react";
import { Lesson } from "@/modules/dashboard/types";

interface LessonCommentsSectionProps {
  studentId: string;
}

export function LessonCommentsSection({
  studentId,
}: LessonCommentsSectionProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await fetch(`/api/lessons?studentId=${studentId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch lessons");
        }
        const data = await response.json();
        // Filter lessons that have tutor comments and are in the past
        const lessonsWithComments = data.filter(
          (lesson: Lesson) =>
            lesson.tutorComment && new Date(lesson.date) < new Date()
        );
        setLessons(lessonsWithComments);
      } catch (error) {
        console.error("Error fetching lessons:", error);
        setError("Erreur lors du chargement des commentaires");
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchLessons();
    }
  }, [studentId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Format HH:MM
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Récapitulatif des leçons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Récapitulatif des leçons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (lessons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Récapitulatif des leçons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<MessageSquare className="h-8 w-8" />}
            title="Aucun commentaire"
            description="Vos tuteurs n'ont pas encore ajouté de commentaires sur vos leçons terminées."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Récapitulatif des leçons ({lessons.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow"
            >
              {/* Lesson Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {lesson.title || "Leçon sans titre"}
                    </h3>
                    {lesson.subject && (
                      <Badge variant="outline" className="text-xs">
                        {lesson.subject}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(lesson.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {lesson.startTime ? formatTime(lesson.startTime) : "N/A"}
                    </span>
                    {lesson.course && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {lesson.course.title}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tutor Comment */}
              {lesson.tutorComment && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-orange-600" />
                    <h4 className="font-medium text-gray-900 text-sm">
                      Commentaire du tuteur
                    </h4>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {lesson.tutorComment}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
