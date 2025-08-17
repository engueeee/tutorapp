"use client";

import { useEffect, useMemo, useCallback } from "react";
import { useUpdateStudentActivity } from "@/hooks/useUpdateStudentActivity";
import { StudentDashboardModule } from "./StudentDashboardModule";
import { Lesson, Homework } from "../types";

interface StudentDashboardWithActivityProps {
  userName: string;
  studentId: string;
  lessons: Lesson[];
  homework: Homework[];
}

export function StudentDashboardWithActivity({
  userName,
  studentId,
  lessons,
  homework,
}: StudentDashboardWithActivityProps) {
  const { updateActivity } = useUpdateStudentActivity();

  // Memoize safe data arrays to prevent unnecessary re-renders
  const safeLessons = useMemo(() => lessons || [], [lessons]);
  const safeHomework = useMemo(() => homework || [], [homework]);

  // Memoize activity update function to prevent unnecessary re-renders
  const handleActivityUpdate = useCallback(() => {
    if (studentId) {
      updateActivity(studentId);
    }
  }, [studentId, updateActivity]);

  useEffect(() => {
    // Update student activity when dashboard loads
    handleActivityUpdate();
  }, [handleActivityUpdate]);

  return <StudentDashboardModule studentId={studentId} userName={userName} />;
}
