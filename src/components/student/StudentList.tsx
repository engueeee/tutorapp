// Fichier : /src/components/students/StudentList.tsx

"use client";

import { useEffect, useState } from "react";
import { Student } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StudentList({
  tutorId,
  refreshFlag,
}: {
  tutorId: string;
  refreshFlag: number;
}) {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch(`/api/students?tutorId=${tutorId}`);
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        console.error("Erreur lors du chargement des étudiants", err);
      }
    }
    fetchStudents();
  }, [tutorId, refreshFlag]);

  if (students.length === 0) {
    return <p className="text-gray-500">Aucun étudiant enregistré.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {students.map((student) => (
        <Card key={student.id} className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">
              {student.firstName} {student.lastName}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700 space-y-1">
            <p>
              <strong>Âge :</strong> {student.age}
            </p>
            <p>
              <strong>Email :</strong> {student.contact}
            </p>
            <p>
              <strong>Niveau :</strong> {student.grade}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
