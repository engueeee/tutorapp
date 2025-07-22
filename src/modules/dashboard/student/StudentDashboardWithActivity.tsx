"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    // Update student activity when dashboard loads
    if (studentId) {
      updateActivity(studentId);
    }
  }, [studentId, updateActivity]);

  return (
    <StudentDashboardModule
      userName={userName}
      studentId={studentId}
      lessons={lessons}
      homework={homework}
    />
  );
}
