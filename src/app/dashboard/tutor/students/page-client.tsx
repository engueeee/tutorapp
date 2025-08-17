"use client";

import { StudentManager } from "@/components/dashboard/StudentManager";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { LoadingUI } from "@/components/ui/LoadingUI";

console.log("TutorStudentsPageClient component loaded");

export default function TutorStudentsPageClient() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  console.log("TutorStudentsPageClient Debug:", {
    user,
    loading,
    userRole: user?.role,
    isTutor: user?.role === "tutor",
  });

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      console.log("Setting loading to false");
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!user || user.role !== "tutor") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingUI variant="page" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingUI variant="page" />
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["tutor"]}>
      <div className="space-y-6">
        {/* Page Content */}
        <div className="space-y-6">
          <StudentManager />
        </div>
      </div>
    </RoleGuard>
  );
}
