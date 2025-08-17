"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { useAuth } from "@/context/AuthContext";

export default function CoursesPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <RoleGuard allowedRoles={["tutor"]}>
      <div className="p-6">
        <CourseGrid tutorId={user.id} />
      </div>
    </RoleGuard>
  );
}
