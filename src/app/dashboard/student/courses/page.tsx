"use client";

import { useAuth } from "@/context/AuthContext";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingUI } from "@/components/ui/LoadingUI";
import { useApi } from "@/hooks/useApi";
import { Course, Lesson } from "@/modules/dashboard/types";
import { LessonCard } from "@/components/ui/LessonCard";
import {
  BookOpen,
  Clock,
  Users,
  Calendar,
  CheckCircle,
  Filter,
  X,
} from "lucide-react";

interface CourseWithDetails extends Course {
  students: any[];
  lessons: Lesson[];
  studentCount: number;
}

export default function StudentCoursesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentId = async () => {
      if (!user || user.role !== "student") {
        setLoading(false);
        return;
      }

      try {
        let response = await fetch(`/api/students?userId=${user.id}`);

        if (response.ok) {
          const students = await response.json();
          if (students.length > 0) {
            setStudentId(students[0].id);
            setLoading(false);
            return;
          }
        }

        // Fallback: try to find student by email
        response = await fetch(
          `/api/students/email?email=${encodeURIComponent(user.email)}`
        );

        if (response.ok) {
          const students = await response.json();
          if (students.length > 0) {
            setStudentId(students[0].id);
            setLoading(false);
            return;
          }
        }

        // Last resort: create a student record for this user
        response = await fetch("/api/students/create-for-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setStudentId(result.student.id);
        }
      } catch (error) {
        console.error("Error fetching student ID:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentId();
  }, [user]);

  // Use optimized API hooks with caching
  const {
    data: courses,
    loading: coursesLoading,
    error: coursesError,
    refetch: refetchCourses,
  } = useApi<CourseWithDetails[]>(
    studentId
      ? `/api/courses?studentId=${encodeURIComponent(
          studentId
        )}&includeLessons=true`
      : null,
    {
      cacheTime: 2 * 60 * 1000, // 2 minutes cache
      staleTime: 30 * 1000, // 30 seconds stale time
    }
  );

  const safeCourses = courses || [];

  // Get available subjects from all lessons
  const availableSubjects = useMemo(() => {
    const subjects = new Set<string>();

    safeCourses.forEach((course) => {
      course.lessons?.forEach((lesson) => {
        if (lesson.subject) {
          subjects.add(lesson.subject);
        }
      });
    });

    return Array.from(subjects).sort();
  }, [safeCourses]);

  // Filter lessons within courses based on selected subject
  const coursesWithFilteredLessons = useMemo(() => {
    if (!selectedSubject) return safeCourses;
    return safeCourses.map((course) => ({
      ...course,
      lessons:
        course.lessons?.filter(
          (lesson) => lesson.subject === selectedSubject
        ) || [],
    }));
  }, [safeCourses, selectedSubject]);

  if (!user || user.role !== "student" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingUI variant="page" message="Chargement..." />
      </div>
    );
  }

  if (!studentId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Erreur</h2>
          <p className="text-gray-600">
            Impossible de récupérer les informations de l'étudiant.
          </p>
        </div>
      </div>
    );
  }

  if (coursesLoading) {
    return <LoadingUI variant="page" message="Chargement des cours..." />;
  }

  if (coursesError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Erreur de chargement
              </h3>
              <p className="text-gray-600 mb-4">
                Impossible de charger vos cours.
              </p>
              <button
                onClick={() => refetchCourses()}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Réessayer
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["student"]}>
      <div className="space-y-6">
        {/* Subject Filter */}
        {availableSubjects.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  <h3 className="font-medium text-gray-900">
                    Filtrer par matière
                  </h3>
                </div>
                {selectedSubject && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSubject(null)}
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                    Effacer
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedSubject === null ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSubject(null)}
                  className="text-xs"
                >
                  Tous les cours
                </Button>
                {availableSubjects.map((subject) => (
                  <Button
                    key={subject}
                    variant={
                      selectedSubject === subject ? "primary" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedSubject(subject)}
                    className="text-xs"
                  >
                    {subject}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {safeCourses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <EmptyState
                icon={<BookOpen className="h-12 w-12 text-gray-400" />}
                title="Aucun cours"
                description="Vous n'êtes inscrit à aucun cours pour le moment."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {coursesWithFilteredLessons.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        {course.title}
                      </CardTitle>
                      {course.lessons?.[0]?.subject && (
                        <Badge variant="secondary" className="text-xs">
                          {course.lessons?.[0]?.subject}
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline">Actif</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      {course.description || "Aucune description"}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.studentCount || 0}
                        {course.studentCount > 1 ? " élèves" : " élève"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.lessons?.length || 0} leçons
                        {selectedSubject && (
                          <span className="text-xs text-gray-400">
                            {" "}
                            (filtrées)
                          </span>
                        )}
                      </span>
                    </div>

                    {course.lessons && course.lessons.length > 0 ? (
                      <div className="mt-6">
                        <h4 className="font-medium text-gray-900 mb-3">
                          Prochaines leçons
                          {selectedSubject && (
                            <span className="text-sm font-normal text-gray-500 ml-2">
                              en {selectedSubject}
                            </span>
                          )}
                        </h4>
                        <div className="space-y-2">
                          {course.lessons
                            .sort(
                              (a, b) =>
                                new Date(a.date).getTime() -
                                new Date(b.date).getTime()
                            )
                            .map((lesson) => (
                              <LessonCard key={lesson.id} lesson={lesson} />
                            ))}
                        </div>
                      </div>
                    ) : selectedSubject ? (
                      <div className="mt-6">
                        <p className="text-sm text-gray-500 italic">
                          Aucune leçon en {selectedSubject} pour ce cours.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
