// Fichier : /src/app/dashboard/tutor/page.tsx

"use client";

import { useAuth } from "@/context/AuthContext";
import { TutorDashboardWithData } from "@/modules/dashboard/tutor/TutorDashboardWithData";

export default function TutorDashboard() {
  const { user } = useAuth();

  if (!user) return null;

  return <TutorDashboardWithData />;
}
