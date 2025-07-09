"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Check, X } from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  grade?: string;
}

interface Course {
  id: string;
  title: string;
  students: Student[];
}

interface AddStudentToCourseFormProps {
  course: Course;
  tutorId: string;
  onStudentAdded?: () => void;
}

export function AddStudentToCourseForm({
  course,
  tutorId,
  onStudentAdded,
}: AddStudentToCourseFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Get current course students IDs for filtering
  const currentStudentIds = course.students.map((student) => student.id);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableStudents();
    }
  }, [isOpen, tutorId]);

  const fetchAvailableStudents = async () => {
    try {
      const response = await fetch(`/api/students?tutorId=${tutorId}`);
      if (response.ok) {
        const allStudents = await response.json();
        // Filter out students already in the course
        const available = allStudents.filter(
          (student: Student) => !currentStudentIds.includes(student.id)
        );
        setAvailableStudents(available);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      alert("Erreur lors du chargement des élèves");
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudentId) {
      alert("Veuillez sélectionner un élève");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/courses", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: course.id,
          tutorId: tutorId,
          studentIds: [selectedStudentId],
        }),
      });

      if (response.ok) {
        setSelectedStudentId("");
        setIsOpen(false);
        onStudentAdded?.();
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de l'ajout de l'élève");
      }
    } catch (error) {
      console.error("Error adding student to course:", error);
      alert("Erreur lors de l'ajout de l'élève");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = availableStudents.filter((student) =>
    `${student.firstName} ${student.lastName} ${student.email || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un élève
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Ajouter un élève au cours
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="course-title">Cours</Label>
            <Input
              id="course-title"
              value={course.title}
              disabled
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="search">Rechercher un élève</Label>
            <Input
              id="search"
              placeholder="Nom, prénom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Élèves disponibles</Label>
            <div className="mt-2 max-h-48 overflow-y-auto border rounded-md">
              {filteredStudents.length > 0 ? (
                <div className="space-y-1 p-2">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-50 ${
                        selectedStudentId === student.id
                          ? "bg-blue-50 border-blue-200"
                          : ""
                      }`}
                      onClick={() => setSelectedStudentId(student.id)}
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {student.firstName} {student.lastName}
                        </div>
                        {student.email && (
                          <div className="text-sm text-gray-500">
                            {student.email}
                          </div>
                        )}
                        {student.grade && (
                          <Badge variant="secondary" className="text-xs">
                            {student.grade}
                          </Badge>
                        )}
                      </div>
                      {selectedStudentId === student.id && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? "Aucun élève trouvé" : "Aucun élève disponible"}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAddStudent}
              disabled={!selectedStudentId || loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                "Ajout en cours..."
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Ajouter
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
