// Fichier : /src/components/students/StudentList.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataCard } from "@/components/ui/DataCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AddStudentForm } from "@/components/forms/AddStudentForm";
import { EditStudentModal } from "./EditStudentModal";
import { StudentCard } from "./StudentCard";
import { useStudents, useCourses } from "@/hooks/useApi";
import { Student } from "@/types";
import { Users, Plus, Calendar } from "lucide-react";
import { toast } from "sonner";

interface StudentListProps {
  tutorId: string;
  refreshFlag: number;
  onStudentAdded?: () => void;
  loggedInStudentId?: string;
}

export function StudentList({
  tutorId,
  refreshFlag,
  onStudentAdded,
  loggedInStudentId,
}: StudentListProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Use custom hooks for data fetching
  const {
    data: students,
    loading: studentsLoading,
    refetch: refetchStudents,
  } = useStudents(tutorId);
  const { data: courses, loading: coursesLoading } = useCourses(tutorId);

  // Filter and sort students
  const filteredStudents = students || [];

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    return `${a.firstName} ${a.lastName}`.localeCompare(
      `${b.firstName} ${b.lastName}`
    );
  });

  const handleDelete = async (id: string) => {
    setLoadingId(id);
    try {
      const { studentsApi } = await import("@/lib/api");
      await studentsApi.delete(id);
      toast.success("Étudiant supprimé avec succès");
      refetchStudents();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setLoadingId(null);
    }
  };

  const handleUpdate = (updatedStudent: Student) => {
    // Refetch students to get updated data
    refetchStudents();
    setIsEditing(false);
    setSelectedStudent(null);
    toast.success("Étudiant mis à jour avec succès");
  };

  const handleStudentAdded = () => {
    refetchStudents();
    setIsAddModalOpen(false);
    onStudentAdded?.();
    toast.success("Étudiant ajouté avec succès");
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStudentStats = () => ({
    total: students?.length || 0,
    active: students?.filter((s) => s.lastActivity)?.length || 0,
    newThisMonth:
      students?.filter((s) => {
        const created = new Date(s.createdAt);
        const now = new Date();
        return (
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear()
        );
      })?.length || 0,
  });

  const stats = getStudentStats();

  if (studentsLoading === "loading" || coursesLoading === "loading") {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DataCard title="Total Étudiants" value={stats.total} icon={Users} />
        <DataCard
          title="Étudiants Actifs"
          value={stats.active}
          icon={Calendar}
        />
        <DataCard
          title="Nouveaux ce mois"
          value={stats.newThisMonth}
          icon={Plus}
        />
      </div>

      {/* Add Student Button */}
      <div className="flex justify-end">
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un étudiant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un étudiant</DialogTitle>
            </DialogHeader>
            <AddStudentForm
              tutorId={tutorId}
              onStudentAdded={handleStudentAdded}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Students List */}
      {sortedStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun étudiant trouvé"
          description="Commencez par ajouter votre premier étudiant."
          action={{
            label: "Ajouter un étudiant",
            onClick: () => setIsAddModalOpen(true),
            icon: Plus,
          }}
        />
      ) : (
        <div className="flex flex-wrap gap-6">
          {sortedStudents.map((student) => (
            <div key={student.id} className="w-full md:w-[calc(50%-12px)]">
              <StudentCard
                student={student}
                onEdit={(student) => {
                  setSelectedStudent(student);
                  setIsEditing(true);
                }}
                onDelete={handleDelete}
                onToggleExpanded={toggleExpanded}
                isExpanded={expandedId === student.id}
                isLoading={loadingId === student.id}
                isCurrentUser={student.id === loggedInStudentId}
              />
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {selectedStudent && (
        <EditStudentModal
          student={selectedStudent as any}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onSave={handleUpdate as any}
        />
      )}
    </div>
  );
}
