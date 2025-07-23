"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { TutorDashboardModule } from "./TutorDashboardModule";
import { Course, Student } from "../types";

export function TutorDashboardWithData() {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch courses
      const coursesRes = await fetch(
        `/api/courses?tutorId=${user.id}&includeStudents=true&includeLessons=true`
      );
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData);
      }

      // Fetch lessons
      const lessonsRes = await fetch(`/api/lessons?tutorId=${user.id}`);
      if (lessonsRes.ok) {
        const lessonsData = await lessonsRes.json();
        setLessons(lessonsData);
      }
    } catch (error) {
      // Handle error silently or show toast
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshFlag]);

  // Handler for when lessons are created/updated
  const handleLessonsChanged = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Handler for when students are added
  const handleStudentAdded = useCallback(() => {
    setRefreshFlag((prev) => prev + 1);
  }, []);

  if (!user) {
    if (token) {
      // User is still loading
      return (
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      );
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
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <TutorDashboardModule
        firstName={user.firstName || ""}
        lastName={user.lastName || ""}
        tutorId={user.id}
        courses={courses}
        lessons={lessons}
        onStudentAdded={handleStudentAdded}
        onLessonsChanged={handleLessonsChanged}
      />
    </div>
  );
}
