// Fichier : /src/app/dashboard/tutor/page.tsx

"use client";

import { useAuth } from "@/context/AuthContext";
import { TutorDashboardWithData } from "@/modules/dashboard/tutor/TutorDashboardWithData";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TutorDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "tutor") {
      if (user.role === "student") {
        router.replace("/dashboard/student");
      } else {
        router.replace("/login");
      }
    }
  }, [user, router]);

  if (!user || user.role !== "tutor") return null;

  return <TutorDashboardWithData />;
}
