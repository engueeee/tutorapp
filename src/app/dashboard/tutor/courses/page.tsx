"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { CourseList } from "@/components/courses/CourseListe";
import { AddCourseForm } from "@/components/courses/AddCourseForm";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function CoursesPage() {
  const { user } = useAuth();
  const [refreshFlag, setRefreshFlag] = useState(0);

  const handleCourseAdded = () => {
    setRefreshFlag((prev) => prev + 1);
  };

  if (!user) return null;

  return (
    <RoleGuard allowedRoles={["tutor"]}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Mes Cours</h1>
          <AddCourseForm tutorId={user.id} />
        </div>
        <CourseList tutorId={user.id} />
      </div>
    </RoleGuard>
  );
}
