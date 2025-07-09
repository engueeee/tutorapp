// Fichier : /src/app/dashboard/student/page.tsx

"use client";

import { useAuth } from "@/context/AuthContext";
import { StudentDashboardModule } from "@/modules/dashboard/student/StudentDashboardModule";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== "student") {
      if (user.role === "tutor") {
        router.replace("/dashboard/tutor");
      } else {
        router.replace("/login");
      }
    }
  }, [user, router]);

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
        } else {
          const errorData = await response.json().catch(() => ({}));
          setError(
            `Impossible de créer le profil étudiant: ${
              errorData.details || errorData.error || "Erreur inconnue"
            }`
          );
        }
      } catch (error) {
        setError("Erreur de connexion au serveur");
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
            {error || "Impossible de récupérer les informations de l'étudiant."}
          </p>
          <p className="text-sm text-gray-500 mt-2 mb-4">
            User ID: {user?.id} | Email: {user?.email}
          </p>
          <div className="space-x-4">
            <Button onClick={() => window.location.reload()} variant="outline">
              Réessayer
            </Button>
            <Button
              onClick={() => {
                logout();
                router.push("/");
              }}
              variant="destructive"
            >
              Se déconnecter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const lessons: any[] = [];
  const homework: any[] = [];

  const userName = user?.email?.split("@")?.[0] || "Student";

  return (
    <StudentDashboardModule
      userName={userName}
      studentId={studentId}
      lessons={lessons}
      homework={homework}
    />
  );
}
