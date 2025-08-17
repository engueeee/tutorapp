"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { TutorDashboardModule } from "./TutorDashboardModule";
import { Course, Student, Lesson } from "../types";
import { useLessonsState } from "@/hooks/useLessonsState";
import { LoadingUI } from "@/components/ui/LoadingUI";
import { useApi, clearApiCache } from "@/hooks/useApi";

export function TutorDashboardWithData() {
  const { user, token } = useAuth();

  // Use optimized API hooks with caching
  const {
    data: courses,
    loading: coursesLoading,
    error: coursesError,
    refetch: refetchCourses,
    mutate: mutateCourses,
  } = useApi<Course[]>(
    user
      ? `/api/courses?tutorId=${user.id}&includeStudents=true&includeLessons=true`
      : null,
    {
      cacheTime: 2 * 60 * 1000, // 2 minutes cache
      staleTime: 30 * 1000, // 30 seconds stale time
    }
  );

  const {
    data: lessonsData,
    loading: lessonsLoading,
    error: lessonsError,
    refetch: refetchLessons,
    mutate: mutateLessons,
  } = useApi<Lesson[]>(user ? `/api/lessons?tutorId=${user.id}` : null, {
    cacheTime: 2 * 60 * 1000, // 2 minutes cache
    staleTime: 30 * 1000, // 30 seconds stale time
  });

  // Use the lessons state hook for optimistic updates
  const { lessons, setLessonsData, addLesson, updateLesson, deleteLesson } =
    useLessonsState(lessonsData || []);

  // Update lessons state when API data changes
  useEffect(() => {
    if (lessonsData) {
      setLessonsData(lessonsData);
    }
  }, [lessonsData, setLessonsData]);

  // Memoize computed values to prevent unnecessary re-renders
  const loading = useMemo(
    () => coursesLoading || lessonsLoading,
    [coursesLoading, lessonsLoading]
  );
  const error = useMemo(
    () => coursesError || lessonsError,
    [coursesError, lessonsError]
  );
  const safeCourses = useMemo(() => courses || [], [courses]);
  const safeLessons = useMemo(() => lessons || [], [lessons]);

  // Memoize user display name to prevent unnecessary re-renders
  const userDisplayName = useMemo(
    () => ({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    }),
    [user?.firstName, user?.lastName]
  );

  // Optimized handler for lesson changes - only refetch lessons
  const handleLessonsChanged = useCallback(async () => {
    await refetchLessons();
  }, [refetchLessons]);

  // Optimized handler for student changes - only refetch courses
  const handleStudentAdded = useCallback(async () => {
    await refetchCourses();
  }, [refetchCourses]);

  // Optimistic update handlers using the hook
  const handleLessonDeleted = useCallback(
    (lessonId: string) => {
      deleteLesson(lessonId);
      // Clear lessons cache to force refetch
      clearApiCache("/api/lessons");
    },
    [deleteLesson]
  );

  const handleLessonUpdated = useCallback(
    (updatedLesson: Lesson) => {
      updateLesson(updatedLesson);
      // Clear lessons cache to force refetch
      clearApiCache("/api/lessons");
    },
    [updateLesson]
  );

  const handleLessonCreated = useCallback(
    (newLesson: Lesson) => {
      addLesson(newLesson);
      // Clear lessons cache to force refetch
      clearApiCache("/api/lessons");
    },
    [addLesson]
  );

  // Memoize retry handler to prevent unnecessary re-renders
  const handleRetry = useCallback(() => {
    refetchCourses();
    refetchLessons();
  }, [refetchCourses, refetchLessons]);

  if (!user) {
    if (token) {
      // User is still loading
      return <LoadingUI variant="dashboard" />;
    }
    // No user and no token: show error
    return (
      <div className="p-6">
        <div className="text-red-600">
          Erreur: Impossible de charger les données utilisateur.
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingUI variant="dashboard" />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">Erreur: {error}</div>
        <button
          onClick={handleRetry}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <TutorDashboardModule
        firstName={userDisplayName.firstName}
        lastName={userDisplayName.lastName}
        tutorId={user.id}
        courses={safeCourses}
        lessons={safeLessons}
        onStudentAdded={handleStudentAdded}
        onLessonsChanged={handleLessonsChanged}
        onLessonDeleted={handleLessonDeleted}
        onLessonUpdated={handleLessonUpdated}
        onLessonCreated={handleLessonCreated}
      />
    </div>
  );
}
