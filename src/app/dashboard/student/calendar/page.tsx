"use client";

import { useAuth } from "@/context/AuthContext";
import { CalendarComponent } from "@/components/calendar/CalendarComponent";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StudentCalendarPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
          return;
        }
      } catch (error) {
        console.error("Error fetching student ID:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentId();
  }, [user]);

  if (!user || user.role !== "student" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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

  return (
    <RoleGuard allowedRoles={["student"]}>
      <div className="space-y-6">
        <CalendarComponent userId={studentId} userRole="student" />
      </div>
    </RoleGuard>
  );
}
