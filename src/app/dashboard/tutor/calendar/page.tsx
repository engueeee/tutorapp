"use client";

import { useAuth } from "@/context/AuthContext";
import { CalendarComponent } from "@/components/calendar/CalendarComponent";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function TutorCalendarPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["tutor"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Calendrier des Leçons
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez vos leçons et événements personnels
          </p>
        </div>
        <CalendarComponent userId={user.id} userRole="tutor" />
      </div>
    </RoleGuard>
  );
}
