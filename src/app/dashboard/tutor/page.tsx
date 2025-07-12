// Fichier : /src/app/dashboard/tutor/page.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TutorDashboardWithData } from "@/modules/dashboard/tutor/TutorDashboardWithData";
import { UniversalOnboarding } from "@/components/onboarding/UniversalOnboarding";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function TutorDashboardPage() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || user.role !== "tutor") {
        setLoading(false);
        return;
      }

      try {
        // Fetch user data to check onboarding status
        const response = await fetch(`/api/users/${user.id}`);
        if (response.ok) {
          const userData = await response.json();
          setUserData(userData);
          setOnboardingCompleted(userData.onboardingCompleted || false);
        } else {
          // If user endpoint doesn't exist or fails, assume onboarding is completed
          setOnboardingCompleted(true);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // Assume onboarding is completed if there's an error
        setOnboardingCompleted(true);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  if (!user || user.role !== "tutor" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show onboarding for new tutors who haven't completed it
  if (!onboardingCompleted) {
    return (
      <RoleGuard allowedRoles={["tutor"]}>
        <UniversalOnboarding
          entityId={user.id}
          userName={user.firstName || user.email?.split("@")?.[0] || "Tuteur"}
          role="tutor"
          onComplete={() => {
            setOnboardingCompleted(true);
          }}
          initialData={userData}
        />
      </RoleGuard>
    );
  }

  return (
    <div>
      <nav className="mb-4 text-sm text-gray-500 flex gap-2">
        <Link
          href="/dashboard/tutor"
          className={
            pathname === "/dashboard/tutor"
              ? "font-bold text-primary"
              : "hover:text-primary"
          }
        >
          Tableau de bord
        </Link>
        <span>/</span>
        <Link
          href="/dashboard/tutor/courses"
          className={
            pathname.startsWith("/dashboard/tutor/courses")
              ? "font-bold text-primary"
              : "hover:text-primary"
          }
        >
          Cours
        </Link>
        <span>/</span>
        <Link
          href="/dashboard/tutor/revenue"
          className={
            pathname.startsWith("/dashboard/tutor/revenue")
              ? "font-bold text-primary"
              : "hover:text-primary"
          }
        >
          Revenus
        </Link>
      </nav>
      <TutorDashboardWithData />
    </div>
  );
}
