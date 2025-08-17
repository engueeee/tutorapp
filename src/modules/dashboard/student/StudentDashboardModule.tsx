"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingUI } from "@/components/ui/LoadingUI";
import { useApi } from "@/hooks/useApi";
import { Course, Lesson } from "../types";
import { LessonCard } from "@/components/ui/LessonCard";
import { TutorInfoCard } from "@/components/ui/TutorInfoCard";
import {
  BookOpen,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Play,
  Users,
  GraduationCap,
} from "lucide-react";

interface StudentDashboardModuleProps {
  studentId: string;
  userName: string;
}

interface CourseWithDetails extends Course {
  students: any[];
  lessons: Lesson[];
  studentCount: number;
  tutor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    profilePhoto?: string;
  };
}

export function StudentDashboardModule({
  studentId,
  userName,
}: StudentDashboardModuleProps) {
  // Use optimized API hooks with caching
  const {
    data: courses,
    loading: coursesLoading,
    error: coursesError,
    refetch: refetchCourses,
  } = useApi<CourseWithDetails[]>(
    `/api/courses?studentId=${encodeURIComponent(
      studentId
    )}&includeLessons=true`,
    {
      cacheTime: 2 * 60 * 1000, // 2 minutes cache
      staleTime: 30 * 1000, // 30 seconds stale time
    }
  );

  const {
    data: recentLessons,
    loading: lessonsLoading,
    error: lessonsError,
    refetch: refetchLessons,
  } = useApi<Lesson[]>(
    `/api/lessons?studentId=${encodeURIComponent(studentId)}&limit=5`,
    {
      cacheTime: 2 * 60 * 1000, // 2 minutes cache
      staleTime: 30 * 1000, // 30 seconds stale time
    }
  );

  const safeCourses = useMemo(() => courses || [], [courses]);
  const safeRecentLessons = useMemo(() => recentLessons || [], [recentLessons]);

  // Get tutor information from the first course (tutor data is already included in the course)
  const tutorData = useMemo(() => {
    if (safeCourses.length > 0 && safeCourses[0].tutor) {
      return safeCourses[0].tutor;
    }
    return null;
  }, [safeCourses]);

  const tutorLoading = false; // No separate loading for tutor since it's included in courses
  const tutorError = null; // No separate error for tutor since it's included in courses

  // Memoize computed values to prevent unnecessary re-renders
  const loading = useMemo(
    () => coursesLoading || lessonsLoading || tutorLoading,
    [coursesLoading, lessonsLoading, tutorLoading]
  );
  const error = useMemo(
    () => coursesError || lessonsError || tutorError,
    [coursesError, lessonsError, tutorError]
  );

  // Memoize utility functions to prevent unnecessary re-renders
  const getNextLesson = useCallback((lessons: Lesson[]) => {
    if (!lessons || lessons.length === 0) return null;

    const now = new Date();
    const upcomingLessons = lessons
      .filter((lesson) => {
        const lessonDate = new Date(lesson.date);
        return lessonDate >= now;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return upcomingLessons[0] || null;
  }, []);

  // Memoize computed data to prevent unnecessary re-renders
  const nextLesson = useMemo(
    () => getNextLesson(safeRecentLessons),
    [getNextLesson, safeRecentLessons]
  );

  const totalLessons = useMemo(() => {
    return safeCourses.reduce(
      (total, course) => total + (course.lessons?.length || 0),
      0
    );
  }, [safeCourses]);

  const totalCourses = useMemo(() => safeCourses.length, [safeCourses]);

  const completedLessons = useMemo(() => {
    const now = new Date();
    return safeCourses.reduce((total, course) => {
      return (
        total +
        (course.lessons?.filter((lesson) => new Date(lesson.date) < now)
          .length || 0)
      );
    }, 0);
  }, [safeCourses]);

  if (loading) {
    return <LoadingUI variant="student-dashboard" />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Erreur de chargement
              </h3>
              <p className="text-gray-600 mb-4">
                Impossible de charger les données du tableau de bord.
              </p>
              <div className="space-x-2">
                <Button
                  onClick={() => refetchCourses()}
                  variant="outline"
                  size="sm"
                >
                  Réessayer les cours
                </Button>
                <Button
                  onClick={() => refetchLessons()}
                  variant="outline"
                  size="sm"
                >
                  Réessayer les leçons
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tutor Information */}
      {tutorData && <TutorInfoCard tutor={tutorData} />}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Cours suivis</p>
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
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Leçons terminées</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedLessons}
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

      {/* Next Lesson */}
      {nextLesson && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Prochaine leçon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LessonCard lesson={nextLesson} showCourse={true} />
          </CardContent>
        </Card>
      )}

      {/* Courses Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Mes cours
          </CardTitle>
        </CardHeader>
        <CardContent>
          {safeCourses.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-12 w-12 text-gray-400" />}
              title="Aucun cours"
              description="Vous n'êtes inscrit à aucun cours pour le moment."
            />
          ) : (
            <div className="space-y-6">
              {safeCourses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          {course.title}
                        </CardTitle>
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
                          {course.studentCount || 0} élèves
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.lessons?.length || 0} leçons
                        </span>
                      </div>

                      {course.lessons && course.lessons.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-medium text-gray-900 mb-3">
                            Prochaines leçons
                          </h4>
                          <div className="space-y-2">
                            {course.lessons
                              .filter(
                                (lesson) => new Date(lesson.date) >= new Date()
                              )
                              .sort(
                                (a, b) =>
                                  new Date(a.date).getTime() -
                                  new Date(b.date).getTime()
                              )
                              .slice(0, 3)
                              .map((lesson) => (
                                <LessonCard key={lesson.id} lesson={lesson} />
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
