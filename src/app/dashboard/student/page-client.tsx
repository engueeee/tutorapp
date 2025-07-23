"use client";

import { useAuth } from "@/context/AuthContext";
import { StudentDashboardWithActivity } from "@/modules/dashboard/student/StudentDashboardWithActivity";
import { UniversalOnboarding } from "@/components/onboarding/UniversalOnboarding";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function StudentDashboardClient() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);
  const userName =
    user?.firstName || user?.email?.split("@")?.[0] || "Étudiant";

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
            const student = students[0];
            setStudentId(student.id);
            setOnboardingCompleted(student.onboardingCompleted || false);
            setStudentData(student);
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
            const student = students[0];
            setStudentId(student.id);
            setOnboardingCompleted(student.onboardingCompleted || false);
            setStudentData(student);
            return;
          }
        }

        // Last resort: create a student record for this user (ONLY if user is a student)
        if (user.role === "student") {
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
            setOnboardingCompleted(false); // New students need onboarding
            setStudentData(result.student);
            return;
          } else {
            const errorData = await response.json().catch(() => ({}));
            setError(
              `Impossible de créer le profil étudiant: ${
                errorData.details || errorData.error || "Erreur inconnue"
              }`
            );
          }
        } else {
          // If user is not a student, set an error
          setError(
            "Accès non autorisé. Cette page est réservée aux étudiants."
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
                router.push("/");
                setTimeout(() => {
                  logout();
                }, 100);
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

  // Show onboarding for new students who haven't completed it
  if (!onboardingCompleted) {
    return (
      <RoleGuard allowedRoles={["student"]}>
        <UniversalOnboarding
          entityId={studentId}
          userName={userName}
          role="student"
          onComplete={async () => {
            // Refresh user data after onboarding completion
            await refreshUser();
            setOnboardingCompleted(true);
            setShowLanding(false);
          }}
          initialData={studentData}
        />
      </RoleGuard>
    );
  }

  // Show landing page for returning students
  if (showLanding) {
    return (
      <RoleGuard allowedRoles={["student"]}>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 flex flex-col items-center gap-6">
            <img
              src="/logo.png"
              alt="TutorApp Logo"
              className="w-24 h-24 mb-2"
            />
            <h1 className="text-3xl font-bold text-primary mb-2 text-center">
              Bienvenue, {userName} !
            </h1>
            <p className="text-gray-600 text-center max-w-md mb-4">
              Accédez rapidement à vos cours, consultez votre calendrier,
              retrouvez les informations de votre tuteur et gérez vos devoirs
              depuis votre espace personnel.
            </p>
            <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
              <Button
                className="w-full md:w-auto"
                onClick={() => setShowLanding(false)}
              >
                Accéder au tableau de bord
              </Button>
              <Button
                variant="outline"
                className="w-full md:w-auto"
                onClick={() => router.push("/dashboard/student/calendar")}
              >
                Mon calendrier
              </Button>
              <Button
                variant="outline"
                className="w-full md:w-auto"
                onClick={() => router.push("/dashboard/student")}
              >
                Mes cours
              </Button>
            </div>
            <div className="mt-6 flex flex-col items-center gap-2">
              <span className="text-sm text-gray-500">
                Besoin d'aide ? Contactez votre tuteur depuis la section dédiée.
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  router.push("/");
                  setTimeout(() => {
                    logout();
                  }, 100);
                }}
              >
                Se déconnecter
              </Button>
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  const lessons: any[] = [];
  const homework: any[] = [];

  return (
    <RoleGuard allowedRoles={["student"]}>
      <StudentDashboardWithActivity
        studentId={studentId}
        lessons={lessons}
        homework={homework}
        userName={userName}
      />
    </RoleGuard>
  );
}
