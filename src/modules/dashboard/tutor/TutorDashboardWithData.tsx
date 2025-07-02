"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { TutorDashboardModule } from "./TutorDashboardModule";
import { DashboardLessonsSection } from "../lessons/DashboardLessonsSection";
import { Course } from "../types";

export function TutorDashboardWithData() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      if (!user) return;

      setLoading(true);
      try {
        const res = await fetch(
          `/api/courses?tutorId=${user.id}&includeStudents=true`
        );
        if (res.ok) {
          const data = await res.json();
          // Transform the data to match the Course interface
          const transformedCourses = data.map((course: any) => ({
            title: course.title,
            students: course.studentCount || 0,
            status: "Active" as const,
          }));
          setCourses(transformedCourses);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [user]);

  if (!user) return null;

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
      />

      {/* Lessons Section */}
      <div className="p-6">
        <DashboardLessonsSection tutorId={user.id} />
      </div>
    </div>
  );
}
