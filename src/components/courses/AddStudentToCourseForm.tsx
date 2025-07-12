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

interface EditCourseStudentsModalProps {
  course: Course;
  tutorId: string;
  onStudentsChanged?: () => void;
}

export function EditCourseStudentsModal({
  course,
  tutorId,
  onStudentsChanged,
}: EditCourseStudentsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    course.students.map((s) => s.id)
  );
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetch(`/api/students?tutorId=${tutorId}`)
        .then((res) => res.json())
        .then(setAllStudents);
      setSelectedIds(course.students.map((s) => s.id));
    }
  }, [isOpen, tutorId, course.id]);

  const handleToggle = (id: string) => {
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((sid) => sid !== id) : [...ids, id]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/courses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          tutorId,
          studentIds: selectedIds,
        }),
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour");
      setIsOpen(false);
      onStudentsChanged?.();
      toast.success("Étudiants mis à jour");
    } catch (e) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const filtered = allStudents.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.email || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="ml-1">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full mx-auto p-2 sm:p-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gérer les élèves du cours
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="course-title">Cours</Label>
            <Input
              id="course-title"
              value={course.title}
              disabled
              className="mt-1 w-full"
            />
          </div>
          <div>
            <Label htmlFor="search">Rechercher un élève</Label>
            <Input
              id="search"
              placeholder="Nom, prénom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1 w-full"
            />
          </div>
          <div>
            <Label>Élèves</Label>
            <div className="mt-2 max-h-48 overflow-y-auto border rounded-md">
              {filtered.length > 0 ? (
                <div className="space-y-1 p-2">
                  {filtered.map((student) => (
                    <div
                      key={student.id}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-50 ${
                        selectedIds.includes(student.id)
                          ? "bg-blue-50 border-blue-200"
                          : ""
                      }`}
                      onClick={() => handleToggle(student.id)}
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
                          <span className="text-xs text-gray-500">
                            {student.grade}
                          </span>
                        )}
                      </div>
                      {selectedIds.includes(student.id) ? (
                        <Check className="h-4 w-4 text-blue-600" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
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
          <div className="flex flex-col sm:flex-row justify-end gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="w-full sm:w-auto min-h-[44px]"
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={loading}
              className="w-full sm:w-auto min-h-[44px]"
            >
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
