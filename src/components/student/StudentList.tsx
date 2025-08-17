// Fichier : /src/components/students/StudentList.tsx

"use client";

import React, { useState, useMemo } from "react";
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
import { LoadingUI } from "@/components/ui/LoadingUI";
import { AddStudentForm } from "@/components/forms/AddStudentForm";
import { EditStudentModal } from "./EditStudentModal";
import { StudentCard } from "./StudentCard";
import { Student } from "@/types";
import { Users, Plus, Calendar, TrendingUp, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/context/AuthContext";
import { CardVariant } from "@/components/ui/card";

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
}: StudentListProps): React.JSX.Element {
  const { user } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Memoize the options to prevent unnecessary re-renders
  const dashboardOptions = useMemo(
    () => ({
      includeStudents: true,
      includeCourses: true,
    }),
    []
  );

  // Use centralized data management
  const {
    data,
    loading: studentsLoading,
    refresh: refetchStudents,
    invalidateCache,
  } = useDashboardData(dashboardOptions);

  const students = data.students || [];
  const courses = data.courses || [];

  // Filter and sort students
  const filteredStudents: Student[] = students;

  const sortedStudents: Student[] = [...filteredStudents].sort((a, b) => {
    return `${a.firstName} ${a.lastName}`.localeCompare(
      `${b.firstName} ${b.lastName}`
    );
  });

  const handleDelete = async (id: string): Promise<void> => {
    setLoadingId(id);
    try {
      const { studentsApi } = await import("@/lib/api");
      await studentsApi.delete(id);
      toast.success("Étudiant supprimé avec succès");
      // Invalidate cache first to ensure fresh data is fetched
      invalidateCache("students");
      refetchStudents();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setLoadingId(null);
    }
  };

  const handleUpdate = (updatedStudent: Student): void => {
    // Invalidate cache first to ensure fresh data is fetched
    invalidateCache("students");
    // Refetch students to get updated data
    refetchStudents();
    setIsEditing(false);
    setSelectedStudent(null);
    toast.success("Étudiant mis à jour avec succès");
  };

  const handleStudentAdded = (): void => {
    // Invalidate cache first to ensure fresh data is fetched
    invalidateCache("students");
    refetchStudents();
    setIsAddModalOpen(false);
    onStudentAdded?.();
    toast.success("Étudiant ajouté avec succès");
  };

  const toggleExpanded = (id: string): void => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStudentStats = (): {
    total: number;
    active: number;
    newThisMonth: number;
    completionRate: number;
  } => {
    const total = students?.length || 0;
    const active = students?.filter((s) => s.lastActivity)?.length || 0;
    const newThisMonth =
      students?.filter((s) => {
        const created = new Date(s.createdAt);
        const now = new Date();
        return (
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear()
        );
      })?.length || 0;
    const completionRate = total > 0 ? Math.round((active / total) * 100) : 0;

    return {
      total,
      active,
      newThisMonth,
      completionRate,
    };
  };

  const stats = getStudentStats();

  if (!user) {
    return <LoadingUI variant="student-manager" />;
  }

  if (studentsLoading) {
    return <LoadingUI variant="student-manager" />;
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-8 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-3">Gestion des Étudiants</h1>
            <p className="text-lg text-white/90 leading-relaxed">
              Gérez votre liste d'étudiants, suivez leurs progrès et optimisez
              leur apprentissage.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-gray-50 font-semibold shadow-md"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Ajouter un étudiant
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold text-[#050f8b]">
                    Ajouter un nouvel étudiant
                  </DialogTitle>
                </DialogHeader>
                <AddStudentForm
                  tutorId={tutorId}
                  onStudentAdded={handleStudentAdded}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardVariant
          variant="default"
          title="Total Étudiants"
          subtitle="Nombre total d'étudiants"
          icon={<Users className="w-8 h-8 text-blue-600" />}
          actionText=""
          onClick={() => {}}
        >
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </CardVariant>

        <CardVariant
          variant="active"
          title="Étudiants Actifs"
          subtitle="Avec activité récente"
          icon={<TrendingUp className="w-8 h-8 text-green-600" />}
          actionText=""
          onClick={() => {}}
        >
          <div className="text-3xl font-bold text-gray-900">{stats.active}</div>
        </CardVariant>

        <CardVariant
          variant="gradient"
          title="Nouveaux ce mois"
          subtitle="Nouveaux étudiants"
          icon={<Plus className="w-8 h-8 text-white" />}
          actionText=""
          onClick={() => {}}
        >
          <div className="text-3xl font-bold text-white">
            {stats.newThisMonth}
          </div>
        </CardVariant>

        <CardVariant
          variant="elevated"
          title="Taux d'activité"
          subtitle="Étudiants actifs"
          icon={<Calendar className="w-8 h-8 text-purple-600" />}
          actionText=""
          onClick={() => {}}
        >
          <div className="text-3xl font-bold text-gray-900">
            {stats.completionRate}%
          </div>
        </CardVariant>
      </div>

      {/* Enhanced Students List Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Liste des Étudiants
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {sortedStudents.length} étudiant
                {sortedStudents.length !== 1 ? "s" : ""} au total
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                <span>Gestion complète</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {sortedStudents.length === 0 ? (
            <EmptyState
              icon={<Users className="h-16 w-16 text-gray-400" />}
              title="Aucun étudiant"
              description="Commencez par ajouter votre premier étudiant pour commencer à donner des cours."
              action={
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un étudiant
                </Button>
              }
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
              {sortedStudents.map((student) => (
                <div key={student.id} className="w-full">
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
        </div>
      </div>

      {/* Edit Modal */}
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
