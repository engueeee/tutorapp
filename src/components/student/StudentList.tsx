// Fichier : /src/components/students/StudentList.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import type { Student as DashboardStudent } from "@/modules/dashboard/types";
import { Course } from "@/modules/dashboard/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditStudentModal } from "./EditStudentModal";
import {
  Trash2,
  BookOpen,
  Mail,
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function StudentList({
  tutorId,
  refreshFlag,
}: {
  tutorId: string;
  refreshFlag: number;
}) {
  const [students, setStudents] = useState<DashboardStudent[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedStudent, setSelectedStudent] =
    useState<DashboardStudent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  useEffect(() => {
    // Validate tutorId before making API calls
    if (!tutorId || tutorId.trim() === "") {
      console.error("StudentList: Invalid tutorId provided:", tutorId);
      toast.error("Erreur", {
        description: "ID du tuteur invalide.",
      });
      return;
    }

    async function fetchStudents() {
      try {
        const res = await fetch(`/api/students?tutorId=${tutorId}`);
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        toast.error("Erreur", {
          description: "Impossible de charger les étudiants.",
        });
      }
    }
    async function fetchCourses() {
      try {
        const res = await fetch(`/api/courses?tutorId=${tutorId}`);

        if (!res.ok) {
          let errorData = {};
          try {
            errorData = await res.json();
          } catch (parseError) {
            console.error(
              "StudentList: Failed to parse error response:",
              parseError
            );
            errorData = { error: "Failed to parse error response" };
          }

          console.error("StudentList: Courses API error response:", errorData);
          console.error("StudentList: Courses API error status:", res.status);
          console.error(
            "StudentList: Courses API error statusText:",
            res.statusText
          );
          console.error(
            "StudentList: Courses API error details:",
            (errorData as any)?.details
          );
          setCourses([]);
          return;
        }

        const data = await res.json();
        if (Array.isArray(data)) {
          setCourses(data);
        } else {
          console.error("StudentList: Courses API returned non-array:", data);
          setCourses([]);
        }
      } catch (err) {
        console.error("StudentList: Error fetching courses:", err);
        setCourses([]);
      }
    }
    fetchStudents();
    fetchCourses();
  }, [tutorId, refreshFlag]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.firstName.toLowerCase().includes(search.toLowerCase()) ||
        student.lastName.toLowerCase().includes(search.toLowerCase()) ||
        (student.email || "").toLowerCase().includes(search.toLowerCase());
      const matchesCourse =
        !filterCourse || student.courses?.some((c) => c.id === filterCourse);
      const matchesStatus =
        !filterStatus ||
        (filterStatus === "active"
          ? (student.courses?.length ?? 0) > 0
          : (student.courses?.length ?? 0) === 0);
      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [students, search, filterCourse, filterStatus]);

  const handleDelete = async (id: string) => {
    const studentToDelete = students.find((s) => s.id === id);
    const confirmDelete = confirm("Supprimer cet étudiant ?");
    if (!confirmDelete) return;
    setLoadingId(id);
    try {
      await fetch(`/api/students/${id}`, { method: "DELETE" });
      setStudents((prev) => prev.filter((s) => s.id !== id));
      toast.success("Étudiant supprimé", {
        description: `${studentToDelete?.firstName} ${studentToDelete?.lastName} a été retiré de vos élèves.`,
      });
    } catch (err) {
      toast.error("Erreur", {
        description: "Échec de la suppression de l'étudiant.",
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleUpdate = (updatedStudent: DashboardStudent) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === updatedStudent.id
          ? { ...updatedStudent, courses: updatedStudent.courses || [] }
          : s
      )
    );
    toast.success("Étudiant mis à jour", {
      description: `${updatedStudent.firstName} ${updatedStudent.lastName} a été modifié avec succès.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-2 md:items-center mb-2">
        <Input
          placeholder="Rechercher un élève..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:w-64"
        />
        <Select value={filterCourse} onValueChange={setFilterCourse}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par cours" />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(courses) &&
              courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="inactive">Inactif</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Student Grid */}
      {filteredStudents.length === 0 ? (
        <p className="text-gray-500">Aucun étudiant trouvé.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => {
            const isActive = (student.courses?.length ?? 0) > 0;
            return (
              <Card
                key={student.id}
                className="shadow-sm border border-gray-200 flex flex-col justify-between"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {student.firstName} {student.lastName}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm">
                      <Mail className="h-4 w-4" />
                      <span>{student.email || "-"}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant={isActive ? "primary" : "outline"}
                      className={
                        isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }
                    >
                      {isActive ? "Actif" : "Inactif"}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        setExpandedId(
                          expandedId === student.id ? null : student.id
                        )
                      }
                      aria-label={
                        expandedId === student.id ? "Réduire" : "Voir plus"
                      }
                    >
                      {expandedId === student.id ? (
                        <ChevronUp />
                      ) : (
                        <ChevronDown />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-gray-700 space-y-1">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="font-medium">Cours :</span>
                    {student.courses && student.courses.length > 0 ? (
                      <span className="truncate">
                        {student.courses.map((c) => c.title).join(", ")}
                      </span>
                    ) : (
                      <span className="text-gray-400">Aucun</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Leçons :</span>
                    <span>
                      {Array.isArray((student as any).lessons)
                        ? (student as any).lessons.length
                        : 0}
                    </span>
                  </div>
                  {expandedId === student.id && (
                    <div className="mt-2 space-y-1 border-t pt-2">
                      <div>
                        <span className="font-medium">Niveau :</span>{" "}
                        {student.grade}
                      </div>
                      {/* Add more details here if needed */}
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsEditing(true);
                          }}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="destructive"
                          disabled={loadingId === student.id}
                          onClick={() => handleDelete(student.id)}
                        >
                          {loadingId === student.id
                            ? "Suppression..."
                            : "Supprimer"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      {selectedStudent && (
        <EditStudentModal
          student={selectedStudent}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onSave={(updated) =>
            handleUpdate({
              ...updated,
              email: updated.email || "",
              grade: updated.grade || "",
              courses: (updated as DashboardStudent).courses || [],
            } as DashboardStudent)
          }
        />
      )}
    </div>
  );
}
