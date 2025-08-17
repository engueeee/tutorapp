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
        <CalendarComponent userId={user.id} userRole="tutor" />
      </div>
    </RoleGuard>
  );
}
