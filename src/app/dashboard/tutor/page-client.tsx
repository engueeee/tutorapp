"use client";

import { useAuth } from "@/context/AuthContext";
import { TutorDashboardWithData } from "@/modules/dashboard/tutor/TutorDashboardWithData";
import { UniversalOnboarding } from "@/components/onboarding/UniversalOnboarding";
import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { LoadingUI } from "@/components/ui/LoadingUI";
import { useFastDashboard } from "@/hooks/useFastDashboard";
import { PerformanceMonitor } from "@/components/ui/PerformanceMonitor";
import { ApiMonitor } from "@/components/ui/ApiMonitor";

export default function TutorDashboardPageClient() {
  const { refreshUser } = useAuth();
  const router = useRouter();

  const { user, userData, loading, error, onboardingCompleted, isReady } =
    useFastDashboard({
      role: "tutor",
      requireOnboarding: true,
    });

  // Handle redirects
  if (isReady && !user) {
    router.replace("/login");
    return null;
  }

  if (isReady && user && user.role !== "tutor") {
    router.replace(`/dashboard/${user.role}`);
    return null;
  }

  // Show loading while auth is initializing or data is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingUI variant="page" message="Chargement du tableau de bord..." />
        <PerformanceMonitor name="TutorDashboard-Loading" />
        <ApiMonitor />
      </div>
    );
  }

  // Show error if there was an issue
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Réessayer
          </button>
        </div>
        <PerformanceMonitor name="TutorDashboard-Error" />
        <ApiMonitor />
      </div>
    );
  }

  // Show onboarding for new tutors who haven't completed it
  if (!onboardingCompleted && user) {
    // Combine user data from auth context with additional data from API for pre-filling
    const initialData = {
      firstName: user.firstName || userData?.firstName || "",
      lastName: user.lastName || userData?.lastName || "",
      email: user.email || userData?.email || "",
      phoneNumber: user.phoneNumber || userData?.phoneNumber || "",
      profilePhoto: user.profilePhoto || userData?.profilePhoto || "",
      bio: userData?.bio || "",
      subjects: userData?.subjects || [],
      experience: userData?.experience || "",
      education: userData?.education || "",
    };

    return (
      <RoleGuard allowedRoles={["tutor"]}>
        <UniversalOnboarding
          entityId={user.id}
          userName={user.firstName || user.email?.split("@")?.[0] || "Tuteur"}
          role="tutor"
          onComplete={async () => {
            // Refresh user data after onboarding completion
            await refreshUser();
            window.location.reload(); // Force reload to update state
          }}
          initialData={initialData}
        />
        <PerformanceMonitor name="TutorDashboard-Onboarding" />
        <ApiMonitor />
      </RoleGuard>
    );
  }

  return (
    <div>
      <TutorDashboardWithData />
      <PerformanceMonitor name="TutorDashboard-Complete" />
      <ApiMonitor />
    </div>
  );
}
