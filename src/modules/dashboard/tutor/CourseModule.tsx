"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingUI } from "@/components/ui/LoadingUI";
import { useAuth } from "@/context/AuthContext";
import { Course } from "../types";
import {
  BookOpen,
  Users,
  Clock,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { QuickLessonCreationModal } from "@/components/courses/QuickLessonCreationModal";
import { useRouter } from "next/navigation";

interface CourseModuleProps {
  tutorId?: string;
  onCourseChanged?: () => void;
}

export function CourseModule({ tutorId, onCourseChanged }: CourseModuleProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [selectedCourseForQuickCreate, setSelectedCourseForQuickCreate] =
    useState<string>("");

  const effectiveTutorId = tutorId || user?.id;

  const fetchCourses = useCallback(async () => {
    if (!effectiveTutorId) return;

    try {
      const res = await fetch(
        `/api/courses?tutorId=${effectiveTutorId}&includeStudents=true&includeLessons=true`
      );
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  }, [effectiveTutorId]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleDeleteCourse = async (course: Course) => {
    setDeletingCourse(course);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteCourse = async () => {
    if (!deletingCourse) return;

    try {
      const res = await fetch(`/api/courses/${deletingCourse.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchCourses();
        if (onCourseChanged) onCourseChanged();
      }
    } catch (error) {
      console.error("Error deleting course:", error);
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingCourse(null);
    }
  };

  const handleLessonCreated = () => {
    fetchCourses();
    if (onCourseChanged) onCourseChanged();
  };

  const handleViewLessons = (course: Course) => {
    router.push(`/dashboard/tutor/courses/${course.id}/lessons`);
  };

  const handleManageCourse = (course: Course) => {
    router.push(`/dashboard/tutor/courses/${course.id}`);
  };

  // Calculate stats
  const totalCourses = courses.length;
  const activeCourses = courses.filter(
    (course) => course.lessons?.length > 0
  ).length;
  const totalLessons = courses.reduce(
    (sum, course) => sum + (course.lessons?.length || 0),
    0
  );

  if (loading) {
    return <LoadingUI variant="course-module" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Mes cours
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Gérez vos cours et vos élèves
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/tutor/courses")}
          className="bg-primary hover:bg-primary/90 text-white font-semibold"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Gérer mes cours
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total cours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalCourses}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Cours actifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeCourses}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total leçons</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalLessons}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Courses Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Cours récents
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/tutor/courses")}
            >
              Voir tous
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-12 w-12" />}
              title="Aucun cours"
              description="Commencez par créer votre premier cours pour organiser vos leçons."
              action={
                <Button
                  onClick={() => router.push("/dashboard/tutor/courses")}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer mon premier cours
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {courses.slice(0, 3).map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {course.description || "Aucune description"}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {course.students?.length || 0} étudiant(s)
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {course.lessons?.length || 0} leçon(s)
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleManageCourse(course)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Gérer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewLessons(course)}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Leçons
                    </Button>
                  </div>
                </div>
              ))}
              {courses.length > 3 && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard/tutor/courses")}
                  >
                    Voir tous les {courses.length} cours
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Course Modal - Removed as it's handled in the courses page */}

      {/* Delete Confirmation Modal */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
          isDeleteModalOpen ? "block" : "hidden"
        }`}
        onClick={() => setIsDeleteModalOpen(false)}
      >
        <div
          className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Supprimer le cours
            </h3>
          </div>
          <p className="text-gray-600 mb-6">
            Êtes-vous sûr de vouloir supprimer le cours "
            <strong>{deletingCourse?.title}</strong>" ? Cette action est
            irréversible.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteCourse}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Lesson Creation Modal */}
      <QuickLessonCreationModal
        tutorId={effectiveTutorId || ""}
        onLessonCreated={handleLessonCreated}
        selectedCourseId={selectedCourseForQuickCreate}
        open={quickCreateOpen}
        onOpenChange={setQuickCreateOpen}
      />
    </div>
  );
}
