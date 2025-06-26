// Fichier : /src/components/StudentManager.tsx

"use client";

import { useState } from "react";
import { AddStudentForm } from "@/components/forms/AddStudentForm";
import { StudentList } from "@/components/student/StudentList";
import { Card, CardContent } from "../ui/card";

export function StudentManager({ tutorId }: { tutorId: string }) {
  const [refreshFlag, setRefreshFlag] = useState(0);

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="overflow-x-auto">
          <AddStudentForm
            tutorId={tutorId}
            onStudentAdded={() => setRefreshFlag((prev) => prev + 1)}
          />
        </CardContent>
      </Card>
      <StudentList tutorId={tutorId} refreshFlag={refreshFlag} />
    </div>
  );
}
