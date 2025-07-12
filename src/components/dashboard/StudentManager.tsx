// Fichier : /src/components/StudentManager.tsx

"use client";

import { useState } from "react";
import { StudentList } from "@/components/student/StudentList";
import { useAuth } from "@/context/AuthContext";

interface StudentManagerProps {
  tutorId: string;
  onStudentAdded?: () => void;
}

export function StudentManager({
  tutorId,
  onStudentAdded,
}: StudentManagerProps) {
  const [refreshFlag, setRefreshFlag] = useState(0);
  const { user } = useAuth();
  const loggedInStudentId =
    user && user.role === "student" ? user.id : undefined;

  // Validate tutorId
  if (!tutorId || tutorId.trim() === "") {
    console.error("StudentManager: Invalid tutorId provided:", tutorId);
    return (
      <div className="space-y-8">
        <div className="text-red-600">Erreur: ID du tuteur invalide.</div>
      </div>
    );
  }

  const handleStudentAdded = () => {
    setRefreshFlag((prev) => prev + 1);
    if (onStudentAdded) {
      onStudentAdded();
    }
  };

  return (
    <div className="space-y-8">
      <StudentList
        tutorId={tutorId}
        refreshFlag={refreshFlag}
        onStudentAdded={handleStudentAdded}
        loggedInStudentId={loggedInStudentId}
      />
    </div>
  );
}
