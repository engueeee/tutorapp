"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Calendar,
  Clock,
  Video,
  Users,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";
import { Lesson, Student } from "@/modules/dashboard/types";
import { StudentAvatar } from "@/components/student/StudentAvatar";
import { LessonCommentModal } from "@/components/courses/LessonCommentModal";
import { toast } from "sonner";

interface CourseLessonsListProps {
  lessons: Lesson[];
  courseId: string;
  onLessonUpdated?: () => void;
}

export function CourseLessonsList({
  lessons,
  courseId,
  onLessonUpdated,
}: CourseLessonsListProps) {
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(
    new Set()
  );
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const toggleLessonExpansion = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

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

  const isPast = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const getLessonStatus = (lesson: Lesson) => {
    const lessonDate = new Date(lesson.date);
    const now = new Date();

    if (lessonDate < now) {
      return {
        status: "completed",
        label: "Terminée",
        color: "bg-gray-100 text-gray-800",
      };
    } else if (lessonDate.toDateString() === now.toDateString()) {
      return {
        status: "today",
        label: "Aujourd'hui",
        color: "bg-blue-100 text-blue-800",
      };
    } else {
      return {
        status: "upcoming",
        label: "À venir",
        color: "bg-green-100 text-green-800",
      };
    }
  };

  const getParticipatingStudents = (lesson: Lesson) => {
    const students: Student[] = [];

    // Add main student if exists
    if (lesson.student) {
      students.push(lesson.student);
    }

    // Add additional students from lessonStudents
    if (lesson.lessonStudents) {
      lesson.lessonStudents.forEach((ls) => {
        if (ls.student && !students.find((s) => s.id === ls.student.id)) {
          students.push(ls.student);
        }
      });
    }

    return students;
  };

  const handleCommentClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCommentModalOpen(true);
  };

  const handleCommentSaved = (updatedLesson: Lesson) => {
    // Update the lesson in the local state
    const updatedLessons = lessons.map((l) =>
      l.id === updatedLesson.id ? updatedLesson : l
    );
    onLessonUpdated?.();

    // Show success toast for comment update
    if (updatedLesson.tutorComment) {
      toast.success("Commentaire mis à jour", {
        description: "Le commentaire de la leçon a été modifié avec succès.",
      });
    } else {
      toast.success("Commentaire supprimé", {
        description: "Le commentaire de la leçon a été supprimé.",
      });
    }
  };

  // Sort lessons by date (most recent first)
  const sortedLessons = [...lessons].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (lessons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Leçons du cours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Calendar className="h-8 w-8" />}
            title="Aucune leçon"
            description="Aucune leçon n'a encore été créée pour ce cours."
            action={
              <Button variant="outline" size="sm">
                Créer une leçon
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Leçons du cours ({lessons.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedLessons.map((lesson) => {
              const status = getLessonStatus(lesson);
              const participatingStudents = getParticipatingStudents(lesson);
              const isExpanded = expandedLessons.has(lesson.id);
              const lessonIsPast = isPast(lesson.date);

              return (
                <div
                  key={lesson.id}
                  className={`border rounded-lg transition-all duration-200 ${
                    lessonIsPast
                      ? "bg-gray-50 border-gray-200"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {/* Lesson Header */}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {lesson.title || "Leçon sans titre"}
                          </h3>
                          <Badge className={status.color}>{status.label}</Badge>
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
                            {lesson.startTime
                              ? formatTime(lesson.startTime)
                              : "N/A"}
                          </span>
                          {lesson.duration && (
                            <span className="text-gray-500">
                              {lesson.duration}
                            </span>
                          )}
                        </div>

                        {/* Participating Students Preview */}
                        {participatingStudents.length > 0 && (
                          <div className="flex items-center gap-2 mt-3">
                            <Users className="h-4 w-4 text-gray-400" />
                            <div className="flex -space-x-2">
                              {participatingStudents
                                .slice(0, 3)
                                .map((student) => (
                                  <StudentAvatar
                                    key={student.id}
                                    student={student}
                                    size="sm"
                                    showStatus={false}
                                  />
                                ))}
                              {participatingStudents.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 border-2 border-white">
                                  +{participatingStudents.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {lesson.zoomLink && (
                          <a
                            href={lesson.zoomLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                            title="Rejoindre la session Zoom"
                          >
                            <Video className="h-4 w-4" />
                          </a>
                        )}
                        {/* Comment button for ended lessons */}
                        {lessonIsPast && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCommentClick(lesson)}
                            className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50"
                            title={
                              lesson.tutorComment
                                ? "Modifier le commentaire"
                                : "Ajouter un commentaire"
                            }
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleLessonExpansion(lesson.id)}
                          className="p-2"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                      {/* Description */}
                      {lesson.description && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Description
                          </h4>
                          <p className="text-sm text-gray-600">
                            {lesson.description}
                          </p>
                        </div>
                      )}

                      {/* Participating Students Details */}
                      {participatingStudents.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Étudiants participants (
                            {participatingStudents.length})
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {participatingStudents.map((student) => (
                              <div
                                key={student.id}
                                className="flex items-center gap-3 p-2 bg-white rounded-md border"
                              >
                                <StudentAvatar
                                  student={student}
                                  size="sm"
                                  showStatus={true}
                                />
                                <div>
                                  <p className="font-medium text-sm text-gray-900">
                                    {student.firstName} {student.lastName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {student.email}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Zoom Link */}
                      {lesson.zoomLink && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Lien de session
                          </h4>
                          <a
                            href={lesson.zoomLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <Video className="h-4 w-4" />
                            Rejoindre la session Zoom
                          </a>
                        </div>
                      )}

                      {/* Tutor Comment */}
                      {lesson.tutorComment && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-orange-600" />
                            Commentaire du tuteur
                          </h4>
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {lesson.tutorComment}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Creation Date */}
                      <div className="text-xs text-gray-500">
                        Créée le {formatDate(lesson.createdAt)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Comment Modal */}
      {selectedLesson && commentModalOpen && (
        <LessonCommentModal
          lesson={selectedLesson}
          open={commentModalOpen}
          onOpenChange={setCommentModalOpen}
          onCommentSaved={handleCommentSaved}
        />
      )}
    </>
  );
}
