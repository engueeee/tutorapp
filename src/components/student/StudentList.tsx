// Fichier : /src/components/students/StudentList.tsx

"use client";

import { useEffect, useState } from "react";
import { Student } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditStudentModal } from "./EditStudentModal";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function StudentList({
  tutorId,
  refreshFlag,
}: {
  tutorId: string;
  refreshFlag: number;
}) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch(`/api/students?tutorId=${tutorId}`);
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        console.error("Erreur lors du chargement des étudiants", err);
        toast.error("Erreur", {
          description: "Impossible de charger les étudiants.",
        });
      }
    }
    fetchStudents();
  }, [tutorId, refreshFlag]);

  const handleDelete = async (id: string) => {
    const studentToDelete = students.find((s) => s.id === id);
    const confirmDelete = confirm("Supprimer cet étudiant ?");
    if (!confirmDelete) return;

    setLoadingId(id);
    try {
      await fetch(`/api/students/${id}`, {
        method: "DELETE",
      });
      setStudents((prev) => prev.filter((s) => s.id !== id));
      toast.success("Étudiant supprimé", {
        description: `${studentToDelete?.firstName} ${studentToDelete?.lastName} a été retiré de vos élèves.`,
      });
    } catch (err) {
      console.error("Erreur lors de la suppression", err);
      toast.error("Erreur", {
        description: "Échec de la suppression de l'étudiant.",
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleUpdate = (updatedStudent: Student) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    toast.success("Étudiant mis à jour", {
      description: `${updatedStudent.firstName} ${updatedStudent.lastName} a été modifié avec succès.`,
    });
  };

  if (students.length === 0) {
    return <p className="text-gray-500">Aucun étudiant enregistré.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {students.map((student) => (
        <Card key={student.id} className="shadow-sm border border-gray-200">
          <CardHeader className="flex justify-between space-x-2">
            <CardTitle className="text-lg">
              {student.firstName} {student.lastName}
            </CardTitle>
            <div className="flex flex-col sm:flex-row justify-between gap-2 pt-6">
              <Button
                variant="destructive"
                disabled={loadingId === student.id}
                onClick={() => handleDelete(student.id)}
                className="w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                <span className="hidden sm:inline">
                  {loadingId === student.id ? "Suppression..." : ""}
                </span>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedStudent(student);
                  setIsEditing(true);
                }}
              >
                Modifier
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.success("Test réussi !")}
              >
                Tester le toast
              </Button>
            </div>
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
            <div className="pt-2"></div>
          </CardContent>
        </Card>
      ))}

      {selectedStudent && (
        <EditStudentModal
          student={selectedStudent}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}
