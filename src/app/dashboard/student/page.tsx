// Fichier : /src/app/dashboard/student/page.tsx

"use client";

import { useAuth } from "@/context/AuthContext";
import { StudentDashboardModule } from "@/modules/dashboard/student/StudentDashboardModule";

export default function StudentDashboard() {
  const { user } = useAuth();

  const lessons = [
    {
      subject: "Introduction to Calculus",
      date: "2024-07-08",
      startTime: "14:00",
      zoomLink: "#",
    },
    {
      subject: "Advanced Linear Algebra",
      date: "2024-07-11",
      startTime: "09:00",
      zoomLink: "#",
    },
  ];

  const homework = [
    {
      title: "Derivatives Exercise",
      dueDate: "2024-07-10",
      status: "pending" as const,
    },
    {
      title: "Matrix Multiplication",
      dueDate: "2024-07-15",
      status: "completed" as const,
    },
  ];

  const userName = user?.email?.split("@")[0] || "Student";

  return (
    <StudentDashboardModule
      userName={userName}
      lessons={lessons}
      homework={homework}
    />
  );
}
