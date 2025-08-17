"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Users,
  Plus,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  Video,
  GraduationCap,
  Trash2,
} from "lucide-react";
import { Course, Lesson } from "@/modules/dashboard/types";
import { QuickLessonCreationModal } from "./QuickLessonCreationModal";
import { toast } from "sonner";

interface CourseCardProps {
  course: Course;
  tutorId: string;
  onCourseChanged?: () => void;
  onLessonCreated?: () => void;
}

export function CourseCard({
  course,
  tutorId,
  onCourseChanged,
  onLessonCreated,
}: CourseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLessonViewOpen, setIsLessonViewOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewLessons = async (course: Course) => {
    try {
      const res = await fetch(
        `/api/courses?tutorId=${tutorId}&includeStudents=true&includeLessons=true`
      );
      if (res.ok) {
        const coursesData = await res.json();
        const updatedCourse = coursesData.find(
          (c: Course) => c.id === course.id
        );
        if (updatedCourse) {
          setSelectedCourse(updatedCourse);
        } else {
          setSelectedCourse(course);
        }
      } else {
        setSelectedCourse(course);
      }
    } catch (error) {
      console.error("Error fetching updated course data:", error);
      setSelectedCourse(course);
    }
    setIsLessonViewOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  // Get all unique students from lessons
  const allLessonStudentIds = new Set<string>();
  (course.lessons || []).forEach((lesson) => {
    if (lesson.student?.id) {
      allLessonStudentIds.add(lesson.student.id);
    }
    if (lesson.lessonStudents) {
      lesson.lessonStudents.forEach((ls) => {
        if (ls.student?.id) {
          allLessonStudentIds.add(ls.student.id);
        }
      });
    }
  });

  const lessonStudentIds = Array.from(allLessonStudentIds);
  const lessonStudents = (course.students || []).filter((s) =>
    lessonStudentIds.includes(s.id)
  );

  const studentsCount = lessonStudents.length;
  const lessonsCount = Array.isArray(course.lessons)
    ? course.lessons.length
    : 0;

  // Helper function to get course subjects (matching CourseModule pattern)
  const getCourseSubjects = (course: Course) => {
    const subjects = new Set<string>();

    // Add course subject if it exists
    if (course.subject) {
      subjects.add(course.subject);
    }

    // Add lesson subjects if they exist
    course.lessons?.forEach((lesson) => {
      if (lesson.subject) {
        subjects.add(lesson.subject);
      }
    });

    return Array.from(subjects);
  };

  const handleDeleteCourse = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/courses?courseId=${course.id}&tutorId=${tutorId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete course");
      }

      toast.success("Cours supprimé", {
        description: `Le cours "${course.title}" et toutes ses leçons ont été supprimés.`,
      });

      // Notify parent components
      if (onCourseChanged) {
        onCourseChanged();
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Erreur", {
        description: "Impossible de supprimer le cours. Veuillez réessayer.",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {course.title}
            </CardTitle>
            {course.description && (
              <p className="text-sm text-gray-600 mb-3">{course.description}</p>
            )}
            {course.zoomLink && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Video className="h-4 w-4" />
                <a
                  href={course.zoomLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Lien Zoom
                </a>
              </div>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-secondary" />
                <span className="font-medium">{studentsCount}</span>
                <span>élève{studentsCount > 1 ? "s" : ""}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4 text-secondary" />
                <span className="font-medium">{lessonsCount}</span>
                <span>leçon{lessonsCount > 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-secondary/10 text-secondary"
            >
              Actif
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 h-8 w-8"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="p-1 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Supprimer le cours"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center gap-2 mb-4">
          <Dialog
            open={isLessonViewOpen && selectedCourse?.id === course.id}
            onOpenChange={setIsLessonViewOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewLessons(course)}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Détails
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Détails du cours - {selectedCourse?.title}
                </DialogTitle>
              </DialogHeader>

              {selectedCourse && (
                <div className="space-y-6">
                  {/* Course Overview Section */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg mb-2">
                          {selectedCourse.title}
                        </h3>
                        {selectedCourse.description && (
                          <p className="text-gray-600 text-sm mb-3">
                            {selectedCourse.description}
                          </p>
                        )}
                        {selectedCourse.zoomLink && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <Video className="h-4 w-4" />
                            <a
                              href={selectedCourse.zoomLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              Lien Zoom
                            </a>
                          </div>
                        )}

                        {/* Subject Badges */}
                        {(() => {
                          const subjects = getCourseSubjects(selectedCourse);
                          return subjects.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {subjects.map(
                                (subject: string, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200"
                                  >
                                    {subject}
                                  </Badge>
                                )
                              )}
                            </div>
                          ) : null;
                        })()}

                        {/* Course Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>
                              {selectedCourse.students?.length || 0} élève
                              {(selectedCourse.students?.length || 0) > 1
                                ? "s"
                                : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <BookOpen className="h-4 w-4" />
                            <span>
                              {selectedCourse.lessons?.length || 0} leçon
                              {(selectedCourse.lessons?.length || 0) > 1
                                ? "s"
                                : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Créé le{" "}
                              {new Date(
                                selectedCourse.createdAt
                              ).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>
                              {selectedCourse.lessons?.length || 0} leçon
                              {(selectedCourse.lessons?.length || 0) > 1
                                ? "s"
                                : ""}{" "}
                              total
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lessons Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Leçons ({selectedCourse.lessons?.length || 0})
                      </h3>
                      <QuickLessonCreationModal
                        tutorId={tutorId}
                        selectedCourseId={selectedCourse.id}
                        onLessonCreated={onLessonCreated}
                        open={isQuickCreateOpen}
                        onOpenChange={setIsQuickCreateOpen}
                        trigger={
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Ajouter une leçon
                          </Button>
                        }
                      />
                    </div>

                    {selectedCourse.lessons &&
                    selectedCourse.lessons.length > 0 ? (
                      <div className="space-y-3">
                        {selectedCourse.lessons.map((lesson) => (
                          <Card
                            key={lesson.id}
                            className="p-4 border-secondary hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-2">
                                  {lesson.title}
                                </h4>
                                {lesson.description && (
                                  <p className="text-gray-600 text-sm mb-3">
                                    {lesson.description}
                                  </p>
                                )}

                                {/* Lesson Subject Badge */}
                                {lesson.subject && (
                                  <div className="mb-3">
                                    <Badge
                                      variant="outline"
                                      className="text-xs px-2 py-1 bg-green-50 text-green-700 border-green-200"
                                    >
                                      {lesson.subject}
                                    </Badge>
                                  </div>
                                )}

                                {/* Lesson Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    <span className="font-medium">Date:</span>
                                    <span>{formatDate(lesson.date)}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="h-4 w-4" />
                                    <span className="font-medium">Heure:</span>
                                    <span>{formatTime(lesson.startTime)}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="h-4 w-4" />
                                    <span className="font-medium">Durée:</span>
                                    <span>{lesson.duration}</span>
                                  </div>
                                </div>

                                {/* Students */}
                                <div className="mt-3 pt-3 border-t">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="h-4 w-4" />
                                    <span className="font-medium">
                                      Élève(s):
                                    </span>
                                    <span>
                                      {(lesson.lessonStudents &&
                                      lesson.lessonStudents.length > 0
                                        ? lesson.lessonStudents.map(
                                            (ls) => ls.student
                                          )
                                        : lesson.student
                                        ? [lesson.student]
                                        : []
                                      ).map((student, index, array) => (
                                        <span key={student.id}>
                                          {student.firstName} {student.lastName}
                                          {index < array.length - 1 ? ", " : ""}
                                        </span>
                                      ))}
                                    </span>
                                  </div>
                                </div>

                                {/* Zoom Link */}
                                {lesson.zoomLink && (
                                  <div className="mt-3 pt-3 border-t">
                                    <a
                                      href={lesson.zoomLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-sm underline flex items-center gap-1"
                                    >
                                      <Video className="h-4 w-4" />
                                      Lien Zoom
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="p-8 text-center">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Aucune leçon
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Aucune leçon n'a été créée pour ce cours.
                        </p>
                        <QuickLessonCreationModal
                          tutorId={tutorId}
                          selectedCourseId={selectedCourse.id}
                          onLessonCreated={onLessonCreated}
                          open={isQuickCreateOpen}
                          onOpenChange={setIsQuickCreateOpen}
                          trigger={
                            <Button className="bg-[#050f8b] hover:bg-[#050f8b]/90">
                              <Plus className="h-4 w-4 mr-2" />
                              Créer une leçon
                            </Button>
                          }
                        />
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <QuickLessonCreationModal
            tutorId={tutorId}
            selectedCourseId={course.id}
            onLessonCreated={onLessonCreated}
            open={isQuickCreateOpen}
            onOpenChange={setIsQuickCreateOpen}
            trigger={
              <Button
                variant="primary"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Ajouter une leçon
              </Button>
            }
          />
        </div>

        {isExpanded && (
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium text-gray-900 mb-3">Élèves inscrits</h4>
            <div className="flex flex-wrap gap-2">
              {lessonStudents.length > 0 ? (
                lessonStudents.map((student) => (
                  <Badge key={student.id} variant="outline" className="text-sm">
                    {student.firstName} {student.lastName}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  Aucun élève inscrit à ce cours
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Supprimer le cours
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-4">
              Êtes-vous sûr de vouloir supprimer le cours "{course.title}" ?
            </p>
            <p className="text-sm text-red-600">
              Cette action est irréversible. Toutes les leçons associées à ce
              cours seront également supprimées.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCourse}
              disabled={isDeleting}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
