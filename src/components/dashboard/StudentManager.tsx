// Fichier : /src/components/StudentManager.tsx

"use client";

import { useState } from "react";
import { AddStudentForm } from "@/components/forms/AddStudentForm";
import { StudentList } from "@/components/student/StudentList";
import { Card, CardContent } from "../ui/card";

interface StudentManagerProps {
  tutorId: string;
  onStudentAdded?: () => void;
}

export function StudentManager({
  tutorId,
  onStudentAdded,
}: StudentManagerProps) {
  const [refreshFlag, setRefreshFlag] = useState(0);

  // Validate tutorId
  if (!tutorId || tutorId.trim() === "") {
    console.error("StudentManager: Invalid tutorId provided:", tutorId);
    return (
      <div className="space-y-8">
        <Card>
          <CardContent className="overflow-x-auto">
            <div className="text-red-600">Erreur: ID du tuteur invalide.</div>
          </CardContent>
        </Card>
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
      <Card>
        <CardContent className="overflow-x-auto">
          <AddStudentForm
            tutorId={tutorId}
            onStudentAdded={handleStudentAdded}
          />
        </CardContent>
      </Card>
      <StudentList tutorId={tutorId} refreshFlag={refreshFlag} />
    </div>
  );
}
