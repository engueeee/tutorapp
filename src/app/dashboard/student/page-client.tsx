"use client";

import { useAuth } from "@/context/AuthContext";
import { StudentDashboardWithActivity } from "@/modules/dashboard/student/StudentDashboardWithActivity";
import { UniversalOnboarding } from "@/components/onboarding/UniversalOnboarding";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { LoadingUI } from "@/components/ui/LoadingUI";

export default function StudentDashboardClient() {
  const { user, loading: authLoading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);
  const userName =
    user?.firstName || user?.email?.split("@")?.[0] || "Étudiant";

  useEffect(() => {
    // If auth is still loading, don't do anything yet
    if (authLoading) {
      return;
    }

    // If no user after auth loading is complete, redirect to login
    if (!user) {
      router.replace("/login");
      return;
    }

    // If user is not a student, redirect to appropriate dashboard
    if (user.role !== "student") {
      router.replace(`/dashboard/${user.role}`);
      return;
    }

    const fetchStudentId = async () => {
      try {
        let response = await fetch(`/api/students?userId=${user.id}`);

        if (response.ok) {
          const students = await response.json();
          if (students.length > 0) {
            const student = students[0];
            setStudentId(student.id);
            setOnboardingCompleted(student.onboardingCompleted || false);
            setStudentData(student);
            setLoading(false);
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
            setLoading(false);
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
            setLoading(false);
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
  }, [user, authLoading, router]);

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingUI variant="page" message="Initialisation..." />
      </div>
    );
  }

  // Show loading while fetching student data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingUI variant="page" message="Chargement du tableau de bord..." />
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
  if (!onboardingCompleted && user) {
    return (
      <RoleGuard allowedRoles={["student"]}>
        <UniversalOnboarding
          entityId={studentId}
          userName={userName}
          role="student"
          onComplete={async () => {
            try {
              // Refresh user data after onboarding completion
              await refreshUser();

              // Also refresh student data to get updated onboarding status
              const response = await fetch(`/api/students?userId=${user.id}`);
              if (response.ok) {
                const students = await response.json();
                if (students.length > 0) {
                  const updatedStudent = students[0];
                  setOnboardingCompleted(
                    updatedStudent.onboardingCompleted || false
                  );
                  setStudentData(updatedStudent);
                }
              }
            } catch (error) {
              console.error("Error refreshing data after onboarding:", error);
              // Fallback: just set onboarding as completed
              setOnboardingCompleted(true);
            }
          }}
          initialData={studentData}
        />
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
