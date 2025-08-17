"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import LandingPage from "@/components/landing/LandingPage";
import { LoadingUI } from "@/components/ui/LoadingUI";

export default function HomePageClient() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "tutor") {
        router.replace("/dashboard/tutor");
      } else if (user.role === "student") {
        router.replace("/dashboard/student");
      }
    }
  }, [user, loading, router]);

  // Show loading while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingUI variant="page" message="Initialisation..." />
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!user) {
    return <LandingPage />;
  }

  // Show loading while redirecting authenticated users
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection en cours...</p>
      </div>
    </div>
  );
}
